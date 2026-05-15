import * as React from "react";
import {browserHistory} from "react-router";
import {connect} from "react-redux";

import {ManageVideoProps, ManageVideoState} from "./types";
import {Chat} from "../index";
import {InputFile} from "../../components/index";
import {sendCall, sendHangUp, sendReject, sendAccept} from "../../services/message.service";
import {subscribeOn} from "../../services/pubsub.service";
import {startRTCConnection, hangUp, getMedia} from "../../services/webrtc.service";
import {uploadFile} from "../../services/user.service";
import {notificationError, notificationSuccess} from "../../services/notification.service";
import {User} from "../../../../common/classes/User";

class ManageVideo extends React.Component<ManageVideoProps, ManageVideoState> {
    state: ManageVideoState;

    private localVideo: HTMLVideoElement;
    private remoteVideo: HTMLVideoElement;

    constructor(props, context) {
        super(props, context);

        this.state = {
            isCalling: false,
            isTesting: false,
            isTestMode: false,
            userId: this.props.user.id,
            isRemoteCallRequest: false,
            isDisplay: false,
            isAnimation: false,
            header: "Video translation",
            userList: this.props.userList
        };

        this.show = this.show.bind(this);
        this.hide = this.hide.bind(this);
        this.onRemoteCall = this.onRemoteCall.bind(this);
        this.accept = this.accept.bind(this);
        this.onAccept = this.onAccept.bind(this);
        this.onReject = this.onReject.bind(this);
        this.reject = this.reject.bind(this);
        this.onCall = this.onCall.bind(this);
        this.hangUp = this.hangUp.bind(this);
        this.onHangUp = this.onHangUp.bind(this);
        this.onVideoSrc = this.onVideoSrc.bind(this);
    }

    componentDidMount() {
        subscribeOn("ManageVideo.hide", this.hide);
        subscribeOn("ManageVideo.show", this.show);

        subscribeOn("call", this.onRemoteCall);
        subscribeOn("remoteCall", this.onRemoteCall);
        subscribeOn("video.src", this.onVideoSrc);
        subscribeOn("hangup", this.onHangUp);
        subscribeOn("accept", this.onAccept);
        subscribeOn("reject", this.onReject);
    }

    componentWillReceiveProps(nextProps) {
        this.setState({
            userList: nextProps.userList,
            userId: nextProps.user.id
        });
    }

    onRemoteCall(callerId: string) {
        if (this.state.isCalling) {
            sendReject(callerId)
                .catch(error => notificationError("Connection refused"));
            this.state.userList.some(user => {
                if (callerId === user.id) {
                    notificationSuccess(User.getName(user) + " is calling you...");
                    return true;
                }
                return false;
            });
        }
        else {
            this.setState({
                isRemoteCallRequest: true,
                remoteUserId: callerId
            });

            this.show();
        }
    }

    accept(event?) {
        event.stopPropagation();

        sendAccept(this.state.remoteUserId)
            .catch(error => notificationError("Connection refused"));
        this.onAccept();
    }

    onAccept() {
        this.setState({
            isCalling: true,
            isRemoteCallRequest: false
        });

        startRTCConnection(this.state.remoteUserId);
    }

    reject() {
        this.onReject();
        sendReject(this.state.remoteUserId)
            .catch(error => notificationError("Connection refused"));
    }

    onReject() {
        this.setState({
            isRemoteCallRequest: false,
            hasCallRejected: true
        });
        setTimeout(this.setState.bind(this, {hasCallRejected: false}), 5000);
    }

    onCall(event) {
        event.stopPropagation();
        sendCall(this.state.remoteUserId)
            .catch(error => notificationError("Connection refused"));
    }

    hangUp() {
        if (this.state.remoteUserId)
            sendHangUp(this.state.remoteUserId)
                .catch(error => notificationError("Connection refused"));
        this.onHangUp();
        hangUp();
    }

    onHangUp() {
        this.setState({isCalling: false});
        hangUp();
    }

    onVideoSrc(target: string, url: string = null) {
        this.localVideo = document.getElementById("localVideo") as HTMLVideoElement;
        this.remoteVideo = document.getElementById("remoteVideo") as HTMLVideoElement;

        if (target === "local")
            this.localVideo.src = url;
        else if (target === "remote")
            this.remoteVideo.src = url;
    }

    test(event) {
        event.stopPropagation();

        if (!this.state.isTesting)
            getMedia();

        this.setState({isTesting: !this.state.isTesting});
    }

    makeScreenshot(event) {
        event.stopPropagation();

        const
            localCanvas: HTMLCanvasElement = document.getElementById("localCanvas") as HTMLCanvasElement,
            ctx = localCanvas.getContext("2d"),
            width = this.localVideo.videoWidth,
            height = this.localVideo.videoHeight;

        localCanvas.width = width;
        localCanvas.height = height;
        ctx.drawImage(this.localVideo, 0, 0, width, height);
    }

    onInputFileChange(event) {
        event.preventDefault();

        const
            avatar: HTMLInputElement = document.getElementById("avatar") as HTMLInputElement,
            file: File = avatar.files[0],
            img: HTMLImageElement = document.getElementById("preview") as HTMLImageElement,
            reader = new FileReader();

        img.classList.add("obj");
        img["file"] = file;

        reader.onload = (aImg => e => aImg.src = e.target.result)(img);

        reader.readAsDataURL(file);

        return false;
    }

    saveImage(event) {
        event.preventDefault();

        const
            formImage: HTMLFormElement = document.getElementById("form-image") as HTMLFormElement,
            formData = new FormData(formImage);

        uploadFile(formData)
            .then(result => console.log(result))
            .catch(e => console.error(e));
    }

    saveScreenshot(event) {
        event.preventDefault();
        console.log("saveScreenshot", this.state.userId);
    }

    show(userId?: string, isTestMode = false) {
        if (!this.state.isDisplay || !this.state.isAnimation) {
            const newState: ManageVideoState = {
                isDisplay: true,
                isTestMode
            };
            if (userId)
                newState.remoteUserId = userId;
            this.setState(newState);
            setTimeout(() => this.setState({isAnimation: true}), 100);
        }
    }

    hide() {
        if (this.state.isDisplay) {
            this.setState({isAnimation: false});
            setTimeout(() => this.setState({isDisplay: false}), 500);
        }
        this.setState({remoteUserId: null});
    }

    render() {
        return <div
            className={"modal fade dialog margin-top-navbar" + (this.state.isDisplay ? " display-flex" : " display-none") + (this.state.isAnimation ? " in" : "")}>
            <div className="modal-dialog margin-auto width-auto width-min-600 video-wrapper">
                <div onClick={!this.state.isCalling && !this.state.isTestMode && this.hide}>
                    <div className="modal-header display-flex header-info">
                        <h4 className="modal-title margin-auto">{this.state.header}</h4>
                        <button
                            type="button"
                            className="close icon-close"
                            data-dismiss="modal"
                            aria-hidden="true"
                            onClick={this.hide}>&times;</button>
                    </div>
                    <div className="modal-body height-auto">
                        {!this.state.isCalling && this.state.remoteUserId &&
                        <div>Partner: <strong>{this.props.getOrgNameById(this.state.remoteUserId, this.state.userList)}</strong></div>}
                        {!this.state.remoteUserId && !this.state.isTestMode && <div>Please choose partner from "Search"</div>}
                        {!this.state.remoteUserId && this.state.isTestMode && <div>Testing video and audio</div>}
                        {this.state.hasCallRejected &&
                        <div>{this.props.getOrgNameById(this.state.remoteUserId, this.state.userList)} rejected your call</div>}
                        <div className="container-fluid">
                            <div className="row">
                                <div className="col-ms-12 col-md-8">
                                    {(this.state.isCalling || this.state.isTesting) && <div className="video-list">
                                        {this.state.isTesting && <canvas id="localCanvas"/>}
                                        {this.state.isTesting && <form id="form-image" encType="multipart/form-data" method="post"
                                                                       onSubmit={this.saveImage.bind(this)}>
                                            <legend>Choose file</legend>
                                            <input type="submit" value="Upload"/>
                                            <img id="preview"/>
                                            <InputFile
                                                name="input-file"
                                                onChange={this.onInputFileChange.bind(this)}/>
                                            <button onClick={this.saveScreenshot}>Save</button>
                                        </form>}
                                        <video
                                            id="remoteVideo"
                                            type="video/mp4"
                                            className={this.state.isCalling ? "display-block" : "display-none"}
                                            poster={this.props.getUserScreenshotById(this.state.userId, this.state.userList)}
                                            controls
                                            autoPlay>
                                            Your browser doesn't support video
                                        </video>
                                        <video
                                            id="localVideo"
                                            type="video/mp4"
                                            className={(this.state.isCalling || this.state.isTesting) ? "display-block" : "display-none"}
                                            muted
                                            autoPlay>
                                            Your browser doesn't support video
                                        </video>
                                    </div>}
                                </div>
                                {this.state.remoteUserId && <div className="col-sm-12 col-md-4">
                                    <Chat remoteUserId={this.state.remoteUserId}/>
                                </div>}
                            </div>
                        </div>
                    </div>
                    <div className="modal-footer buttonList">
                        {this.state.isTestMode && this.state.isTesting && <button
                            key="screenshotButton"
                            aria-label="Center"
                            onClick={this.makeScreenshot.bind(this)}>
                            Make screenshot
                        </button>}
                        {this.state.isTestMode && <button
                            key="testButton"
                            aria-label="Center Align"
                            onClick={this.test.bind(this)}>
                            {this.state.isTesting ? "Stop" : "Test"}
                        </button>}
                        {!this.state.isRemoteCallRequest && !this.state.isTestMode && <button
                            key="callButton"
                            aria-label="Left Align"
                            onClick={this.state.isCalling ? this.hangUp : this.onCall}>
                            {this.state.isCalling ? "Hang Up" : "Call"}
                        </button>}
                        {this.state.isRemoteCallRequest && <button
                            key="acceptButton"
                            aria-label="Left Align"
                            onClick={this.accept}>
                            Accept
                        </button>}
                        {this.state.isRemoteCallRequest && <button
                            key="rejectButton"
                            aria-label="Left Align"
                            onClick={this.reject}>
                            Reject
                        </button>}
                    </div>
                </div>
            </div>
        </div>;
    }
}

function mapStateToProps(state) {
    return state;
}

export default connect(mapStateToProps)(ManageVideo);
