import {afterEach, beforeEach, describe, expect, it, vi} from "vitest";

describe("Testing webrtc.service.ts", () => {
    const originalGetUserMedia = navigator["getUserMedia"];
    const originalRTCPeerConnection = window["RTCPeerConnection"];
    const originalRTCIceCandidate = window["RTCIceCandidate"];
    const originalRTCSessionDescription = window["RTCSessionDescription"];
    const originalConsoleError = console.error;

    let publishEvent;
    let subscribeOn;
    let sendSignal;
    let notificationError;
    let getUserMedia;
    let signalHandler;
    let createdPeerConnections;
    let service: typeof import("./webrtc.service");

    class MockRTCPeerConnection {
        config;
        constraints;
        addStream = vi.fn();
        removeStream = vi.fn();
        close = vi.fn(() => this.signalingState = "closed");
        createOffer = vi.fn(() => Promise.resolve({type: "offer"}));
        createAnswer = vi.fn(() => Promise.resolve({type: "answer"}));
        setLocalDescription = vi.fn(desc => {
            this.localDescription = desc;
            return Promise.resolve();
        });
        setRemoteDescription = vi.fn(desc => {
            this.remoteDescription = desc;
            return Promise.resolve();
        });
        addIceCandidate = vi.fn(() => Promise.resolve());
        localDescription;
        remoteDescription;
        signalingState = "stable";
        iceConnectionState = "new";
        onicecandidate;
        onnegotiationneeded;
        onsignalingstatechange;
        onaddstream;

        constructor(config, constraints) {
            this.config = config;
            this.constraints = constraints;
            createdPeerConnections.push(this);
        }
    }

    beforeEach(async () => {
        publishEvent = vi.fn();
        subscribeOn = vi.fn((event, handler) => {
            if (event === "signal")
                signalHandler = handler;
        });
        sendSignal = vi.fn(() => Promise.resolve());
        notificationError = vi.fn();
        getUserMedia = vi.fn((constraints, onSuccess) => onSuccess({id: "local-stream"}));
        createdPeerConnections = [];
        console.error = vi.fn();

        Object.defineProperty(navigator, "getUserMedia", {
            configurable: true,
            value: getUserMedia
        });
        window["RTCPeerConnection"] = MockRTCPeerConnection as any;
        window["RTCIceCandidate"] = class {
            constructor(candidate) {
                Object.assign(this, candidate);
            }
        } as any;
        window["RTCSessionDescription"] = class {
            constructor(description) {
                Object.assign(this, description);
            }
        } as any;
        vi.spyOn(URL, "createObjectURL").mockImplementation(stream => "blob:" + (stream as any).id);

        vi.resetModules();
        vi.doMock("./pubsub.service", () => ({publishEvent, subscribeOn}));
        vi.doMock("./message.service", () => ({sendSignal}));
        vi.doMock("./notification.service", () => ({notificationError}));
        vi.doMock("../config/config", () => ({
            BROWSER: {
                isFirefox: false,
                isChrome: false,
                isOpera: false,
                version: null
            },
            IS_PRODUCTION: false
        }));

        service = await import("./webrtc.service");
    });

    afterEach(() => {
        Object.defineProperty(navigator, "getUserMedia", {
            configurable: true,
            value: originalGetUserMedia
        });
        window["RTCPeerConnection"] = originalRTCPeerConnection;
        window["RTCIceCandidate"] = originalRTCIceCandidate;
        window["RTCSessionDescription"] = originalRTCSessionDescription;
        console.error = originalConsoleError;
        vi.restoreAllMocks();
        vi.resetModules();
    });

    const flushPromises = () => new Promise(resolve => setTimeout(resolve, 0));

    it("subscribes to signal events on import", () => {
        expect(subscribeOn).toHaveBeenCalledWith("signal", expect.any(Function));
        expect(signalHandler).toEqual(expect.any(Function));
    });

    it("starts a peer connection, publishes local media, and sends local ICE/SDP", async () => {
        const pc = service.startRTCConnection("remote-user") as any;
        const createdPc = createdPeerConnections[0];

        expect(pc).toEqual(undefined);
        expect(createdPc.addStream).toHaveBeenCalledWith({id: "local-stream"});
        expect(getUserMedia).toHaveBeenCalledWith(
            {audio: false, video: true},
            expect.any(Function),
            expect.any(Function)
        );
        expect(publishEvent).toHaveBeenCalledWith("video.src", "local", "blob:local-stream");

        createdPc.onicecandidate({candidate: {candidate: "ice-1"}});
        expect(sendSignal).toHaveBeenCalledWith("remote-user", {
            command: "iceCandidate",
            data: {candidate: {candidate: "ice-1"}}
        });

        createdPc.onnegotiationneeded();
        await flushPromises();

        expect(createdPc.createOffer).toHaveBeenCalled();
        expect(createdPc.setLocalDescription).toHaveBeenCalledWith({type: "offer"});
        expect(sendSignal).toHaveBeenCalledWith("remote-user", {
            command: "SDP",
            data: {sdp: {type: "offer"}}
        });
    });

    it("answers inbound SDP offers and sends the answer to the signaling user", async () => {
        signalHandler("caller-user", {data: {sdp: {type: "offer"}}});
        await flushPromises();

        const pc = createdPeerConnections[0];

        expect(pc.setRemoteDescription).toHaveBeenCalledWith({type: "offer"});
        expect(pc.createAnswer).toHaveBeenCalled();
        expect(pc.setLocalDescription).toHaveBeenCalledWith({type: "answer"});
        expect(sendSignal).toHaveBeenCalledWith("caller-user", {
            command: "SDP",
            data: {sdp: {type: "answer"}}
        });
    });

    it("adds inbound ICE candidates", async () => {
        service.createRTCPeerConnection();
        const pc = createdPeerConnections[0];

        signalHandler("caller-user", {data: {candidate: {candidate: "ice-2"}}});
        await flushPromises();

        expect(pc.addIceCandidate).toHaveBeenCalledWith({candidate: "ice-2"});
    });

    it("notifies when SDP arrives while ICE connection has failed", () => {
        service.createRTCPeerConnection();
        const pc = createdPeerConnections[0];
        pc.iceConnectionState = "failed";

        signalHandler("caller-user", {data: {sdp: {type: "offer"}}});

        expect(notificationError).toHaveBeenCalledWith("Plese check Internet connection");
        expect(pc.setRemoteDescription).not.toHaveBeenCalled();
    });

    it("publishes remote streams and hangUp removes remote stream and closes the connection", () => {
        service.createRTCPeerConnection();
        const pc = createdPeerConnections[0];
        const remoteStream = {id: "remote-stream"};

        pc.onaddstream({stream: remoteStream});
        service.hangUp();

        expect(publishEvent).toHaveBeenCalledWith("video.src", "remote", "blob:remote-stream");
        expect(pc.removeStream).toHaveBeenCalledWith(remoteStream);
        expect(pc.close).toHaveBeenCalled();
    });

    it("hangs up and notifies when signaling state reports failed ICE", () => {
        service.createRTCPeerConnection();
        const pc = createdPeerConnections[0];

        pc.onsignalingstatechange({iceConnectionState: "failed"});

        expect(notificationError).toHaveBeenCalledWith("ICE Connection failed");
        expect(pc.close).toHaveBeenCalled();
    });

    it("notifies when getUserMedia throws during getMedia", async () => {
        getUserMedia.mockImplementation(() => {
            throw new Error("not supported");
        });
        vi.resetModules();
        service = await import("./webrtc.service");

        service.getMedia();

        expect(console.error).toHaveBeenCalled();
        expect(notificationError).toHaveBeenCalledWith("It seems that your browser doesn't support WEBRTC video exchange. Please try open the site using another browser.");
    });
});
