import { Context } from "react";
import {afterEach, beforeEach, describe, expect, it, Mock, vi} from "vitest";
import {ManageVideo} from "./ManageVideo";

describe("Testing ManageVideo.tsx", () => {
    let sendCall: Mock<() => Promise<void>>;
    let sendHangUp: Mock<() => Promise<void>>;
    let sendReject: Mock<() => Promise<void>>;
    let sendAccept: Mock<() => Promise<void>>;
    let subscribeOn: Mock;
    let startRTCConnection: Mock;
    let hangUpRtc: Mock;
    let getMedia: Mock;
    let uploadFile: Mock<() => Promise<{ ok: boolean; }>>;
    let notificationError: Mock;
    let notificationSuccess: Mock;
    let ManageVideoComponent: { new(arg0: { user: { id: string; }; userList: any; getOrgNameById: Mock<(id: any) => "Remote Org" | "Unknown">; getUserScreenshotById: Mock<() => string>; }, arg1: null): any; new(props: any, context: any): ManageVideo; prototype?: any; contextType?: Context<any>; propTypes?: any; };

    const userList = [
        {
            id: "remote-user",
            local: {
                firstName: "Remote",
                lastName: "User"
            },
            org: {
                name: "Remote Org"
            }
        }
    ] as any;

    const createInstance = () => {
        const props = {
            user: {id: "self-user"},
            userList,
            getOrgNameById: vi.fn((id) => id === "remote-user" ? "Remote Org" : "Unknown"),
            getUserScreenshotById: vi.fn(() => "preview.png")
        };
        const instance = new ManageVideoComponent(props, null) as any;
        instance.setState = update => {
            const nextState = typeof update === "function" ? update(instance.state, instance.props) : update;
            instance.state = {...instance.state, ...nextState};
        };
        return {instance, props};
    };

    beforeEach(async () => {
        sendCall = vi.fn(() => Promise.resolve());
        sendHangUp = vi.fn(() => Promise.resolve());
        sendReject = vi.fn(() => Promise.resolve());
        sendAccept = vi.fn(() => Promise.resolve());
        subscribeOn = vi.fn();
        startRTCConnection = vi.fn();
        hangUpRtc = vi.fn();
        getMedia = vi.fn();
        uploadFile = vi.fn(() => Promise.resolve({ok: true}));
        notificationError = vi.fn();
        notificationSuccess = vi.fn();
        vi.useFakeTimers();

        vi.resetModules();
        vi.doMock("../../services/message.service", () => ({
            sendCall,
            sendHangUp,
            sendReject,
            sendAccept
        }));
        vi.doMock("../../services/pubsub.service", () => ({subscribeOn}));
        vi.doMock("../../services/webrtc.service", () => ({
            startRTCConnection,
            hangUp: hangUpRtc,
            getMedia
        }));
        vi.doMock("../../services/user.service", () => ({uploadFile}));
        vi.doMock("../../services/notification.service", () => ({notificationError, notificationSuccess}));
        vi.doMock("../index", () => ({Chat: ({remoteUserId}) => `Chat ${remoteUserId}`}));

        ManageVideoComponent = (await import("./ManageVideo")).ManageVideo;
    });

    afterEach(() => {
        vi.useRealTimers();
        document.body.innerHTML = "";
    });

    it("subscribes to video and call events on mount", () => {
        const {instance} = createInstance();

        instance.componentDidMount();

        expect(subscribeOn).toHaveBeenCalledWith("ManageVideo.hide", instance.hide);
        expect(subscribeOn).toHaveBeenCalledWith("ManageVideo.show", instance.show);
        expect(subscribeOn).toHaveBeenCalledWith("call", instance.onRemoteCall);
        expect(subscribeOn).toHaveBeenCalledWith("video.src", instance.onVideoSrc);
        expect(subscribeOn).toHaveBeenCalledWith("reject", instance.onReject);
    });

    it("shows an incoming call and rejects calls while already calling", () => {
        const {instance} = createInstance();

        instance.onRemoteCall("remote-user");

        expect(instance.state.isRemoteCallRequest).toEqual(true);
        expect(instance.state.remoteUserId).toEqual("remote-user");
        expect(instance.state.isDisplay).toEqual(true);

        instance.state.isCalling = true;
        instance.onRemoteCall("remote-user");

        expect(sendReject).toHaveBeenCalledWith("remote-user");
        expect(notificationSuccess).toHaveBeenCalledWith("Remote User is calling you...");
    });

    it("accepts and rejects a remote call", () => {
        const {instance} = createInstance();
        const event = {stopPropagation: vi.fn()};

        instance.state.remoteUserId = "remote-user";
        instance.accept(event);

        expect(event.stopPropagation).toHaveBeenCalled();
        expect(sendAccept).toHaveBeenCalledWith("remote-user");
        expect(startRTCConnection).toHaveBeenCalledWith("remote-user");
        expect(instance.state.isCalling).toEqual(true);

        instance.reject();

        expect(sendReject).toHaveBeenCalledWith("remote-user");
        expect(instance.state.hasCallRejected).toEqual(true);
        vi.runAllTimers();
        expect(instance.state.hasCallRejected).toEqual(false);
    });

    it("calls, hangs up, and handles video sources", () => {
        const {instance} = createInstance();
        const event = {stopPropagation: vi.fn()};

        instance.state.remoteUserId = "remote-user";
        instance.onCall(event);
        expect(event.stopPropagation).toHaveBeenCalled();
        expect(sendCall).toHaveBeenCalledWith("remote-user");

        instance.hangUp();
        expect(sendHangUp).toHaveBeenCalledWith("remote-user");
        expect(hangUpRtc).toHaveBeenCalled();
        expect(instance.state.isCalling).toEqual(false);

        document.body.innerHTML = '<video id="localVideo"></video><video id="remoteVideo"></video>';
        instance.onVideoSrc("local", "local.webm");
        instance.onVideoSrc("remote", "remote.webm");
        expect((document.getElementById("localVideo") as HTMLVideoElement).src).toContain("local.webm");
        expect((document.getElementById("remoteVideo") as HTMLVideoElement).src).toContain("remote.webm");
    });
});
