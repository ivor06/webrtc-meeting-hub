import {isArray, isString} from "../../../common/util";
import {turnServerList} from "../config/stunServerList";
import {BROWSER, IS_PRODUCTION} from "../config/config";
import {publishEvent, subscribeOn} from "./pubsub.service";
import {sendSignal} from "./message.service";
import {notificationError} from "./notification.service";

const
    getUserMedia = BROWSER.isFirefox
        ? (navigator["mozGetUserMedia"]).bind(navigator)
        : (navigator.getUserMedia || navigator["webkitGetUserMedia"] || navigator["mozGetUserMedia"]).bind(navigator),
    RTCPeerConn: RTCPeerConnection = window["RTCPeerConnection"] || window["mozRTCPeerConnection"] || window["webkitRTCPeerConnection"] || window["PeerConnection"],
    RTCIceCandidate = window["RTCIceCandidate"] || window["mozRTCIceCandidate"] || window["webkitRTCIceCandidate"],
    RTCSessionDescription = window["RTCSessionDescription"] || window["mozRTCSessionDescription"] || window["webkitRTCSessionDescription"],
    pcConfiguration = {
        iceServers: turnServerList
    },
    fixConfiguration = (config: RTCConfiguration) => {
        const
            fixedConfig = Object.assign({}, config),
            iceServerList = [];
        if (fixedConfig.iceServers && fixedConfig.iceServers.length)
            fixedConfig.iceServers.forEach(iceServer => {
                if (isString(iceServer.urls)) {
                    iceServer["url"] = iceServer.urls;
                    delete iceServer.urls;
                    iceServerList.push(iceServer);
                } else if (isArray(iceServer.urls) && iceServer.urls.length) {
                    const iceServ = {};
                    if (iceServer.username)
                        iceServ["username"] = iceServer.username;
                    if (iceServer.credential)
                        iceServ["credential"] = iceServer.credential;
                    iceServer.urls.forEach(url => iceServerList.push(Object.assign({url}, iceServ)));
                }
            });
        fixedConfig.iceServers = iceServerList;
        return fixedConfig;
    };

let
    rtcPC: RTCPeerConnection = null,
    remoteStream: MediaStream,
    remoteUserId: string;

subscribeOn("signal", onSignal);

export {
    createRTCPeerConnection,
    startRTCConnection,
    getMedia,
    hangUp
}

function hangUp() {
    if (rtcPC) {
        if (rtcPC["signalingState"] !== "closed" && remoteStream) {
            rtcPC.removeStream && rtcPC.removeStream(remoteStream);
            remoteStream = null;
        }

        rtcPC.close && rtcPC.signalingState !== "closed" && rtcPC.close();

        rtcPC = null;
    }
    remoteUserId = null;
}

function startRTCConnection(remoteUid: string) {
    if (rtcPC)
        hangUp();
    remoteUserId = remoteUid;
    createRTCPeerConnection();
}

function onSignal(userId: string, signal) {

    if (!rtcPC)
        createRTCPeerConnection();

    const signalObj = signal.data;

    if (rtcPC) {
        if (signalObj.sdp) {
            if (rtcPC.iceConnectionState === "failed")
                notificationError("Plese check Internet connection");
            else
                rtcPC.setRemoteDescription(new RTCSessionDescription(signalObj.sdp))
                    .then(() => {
                        if (rtcPC.remoteDescription.type === "offer")
                            rtcPC.createAnswer()
                                .then(sendLocalDescription)
                                .catch(console.error.bind(console, "catch createAnswer"));
                    })
                    .catch(console.error.bind(console));
        }
        else if (signalObj.candidate)
            rtcPC
                .addIceCandidate(new RTCIceCandidate(signalObj.candidate))
                .catch(console.error.bind(console));
    }
}

function sendLocalDescription(desc) {
    if (rtcPC) {
        rtcPC.setLocalDescription(desc)
            .then(() => sendSignal(remoteUserId, {command: "SDP", data: {"sdp": rtcPC.localDescription}}))
            .catch(console.error.bind(console));
    }
}

function createRTCPeerConnection(pcConfig: RTCConfiguration = IS_PRODUCTION ? pcConfiguration : pcConfiguration, pcConstraints?: RTCPeerConnection) {

    if (rtcPC)
        hangUp();

    if (BROWSER.isFirefox && BROWSER.version < 37 || BROWSER.isChrome && BROWSER.version < 34)
        pcConfig = fixConfiguration(pcConfig);

    rtcPC = new (RTCPeerConn as any)(pcConfig, pcConstraints);

    rtcPC.onicecandidate = evt => {
        if (evt.candidate)
            sendSignal(remoteUserId, {command: "iceCandidate", data: {"candidate": evt.candidate}});
    };

    rtcPC.onnegotiationneeded = () => {
        rtcPC.createOffer()
            .then(sendLocalDescription)
            .catch(console.error.bind(console));
    };

    rtcPC.onsignalingstatechange = event => {
        if (event["iceConnectionState"] === "failed") {
            notificationError("ICE Connection failed");
            hangUp();
        }
    };

    rtcPC.onaddstream = (evt) => { // TODO onaddstream is deprecated
        if (evt.stream) {
            remoteStream = evt.stream;
            publishEvent("video.src", "remote", URL.createObjectURL(remoteStream));
        }
    };

    getMedia(rtcPC);

    return rtcPC;
}

function getMedia(rtcPCObject?: RTCPeerConnection) {
    try {
        getUserMedia(
            {
                "audio": IS_PRODUCTION,
                "video": true
            },
            stream => {
                if (rtcPCObject)
                    rtcPCObject.addStream(stream);
                publishEvent("video.src", "local", URL.createObjectURL(stream));
            },
            notificationError.bind(null, "Did you allow using of webcam?")
        );
    } catch (e) {
        console.error(e);
        notificationError("It seems that your browser doesn't support WEBRTC video exchange. Please try open the site using another browser.");
    }
}
