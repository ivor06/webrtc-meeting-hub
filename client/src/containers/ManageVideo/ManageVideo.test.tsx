import { Context } from "react";
import {render} from "@testing-library/react";
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

    it("toggles media testing and creates screenshots", () => {
        const {instance} = createInstance();
        const event = {stopPropagation: vi.fn()};
        const drawImage = vi.fn();
        const canvas = document.createElement("canvas");
        const localVideo = document.createElement("video");

        vi.spyOn(canvas, "getContext").mockReturnValue({drawImage} as any);
        Object.defineProperty(localVideo, "videoWidth", {value: 640});
        Object.defineProperty(localVideo, "videoHeight", {value: 480});
        canvas.id = "localCanvas";
        localVideo.id = "localVideo";
        document.body.append(canvas, localVideo);

        instance.test(event);
        expect(getMedia).toHaveBeenCalled();
        expect(instance.state.isTesting).toEqual(true);
        instance.test(event);
        expect(getMedia).toHaveBeenCalledTimes(1);

        instance.localVideo = localVideo;
        instance.makeScreenshot(event);
        expect(drawImage).toHaveBeenCalledWith(localVideo, 0, 0, 640, 480);
    });

    it("shows and hides the video dialog", () => {
        const {instance} = createInstance();

        instance.show("remote-user", true);
        expect(instance.state.isDisplay).toEqual(true);
        expect(instance.state.isTestMode).toEqual(true);
        expect(instance.state.remoteUserId).toEqual("remote-user");
        vi.runAllTimers();
        expect(instance.state.isAnimation).toEqual(true);

        instance.hide();
        expect(instance.state.remoteUserId).toEqual(null);
        vi.runAllTimers();
        expect(instance.state.isDisplay).toEqual(false);
    });

    it("renders the partner, testing, calling, and incoming-call states", () => {
        const {instance} = createInstance();

        render(instance.render());
        instance.state.remoteUserId = "remote-user";
        render(instance.render());
        instance.state.isTestMode = true;
        instance.state.remoteUserId = null;
        render(instance.render());
        instance.state.isTesting = true;
        render(instance.render());
        instance.state.isCalling = true;
        instance.state.isRemoteCallRequest = false;
        render(instance.render());
        instance.state.isCalling = false;
        instance.state.isRemoteCallRequest = true;
        render(instance.render());

        expect(instance.render()).toBeTruthy();
    });

    it("handles rejected messaging and media operations", async () => {
        const {instance} = createInstance();
        const event = {stopPropagation: vi.fn(), preventDefault: vi.fn()};
        const error = new Error("failed");

        sendReject.mockRejectedValue(error);
        sendAccept.mockRejectedValue(error);
        sendCall.mockRejectedValue(error);
        sendHangUp.mockRejectedValue(error);
        uploadFile.mockRejectedValue(error);
        const form = document.createElement("form");
        form.id = "form-image";
        document.body.append(form);

        instance.state.remoteUserId = "remote-user";
        instance.onRemoteCall("remote-user");
        instance.accept(event);
        instance.reject();
        instance.onCall(event);
        instance.hangUp();
        instance.saveImage(event);
        await Promise.resolve();
        await Promise.resolve();

        expect(notificationError).toHaveBeenCalledWith("Connection refused");
        expect(event.preventDefault).toHaveBeenCalled();
    });

    it("handles file input, empty dialog states, and prop updates", () => {
        const {instance} = createInstance();
        const input = document.createElement("input");
        const preview = document.createElement("img");
        const form = document.createElement("form");
        const file = new File(["image"], "image.png", {type: "image/png"});
        input.id = "avatar";
        Object.defineProperty(input, "files", {value: [file]});
        preview.id = "preview";
        form.id = "form-image";
        document.body.append(input, preview, form);
        vi.spyOn(FileReader.prototype, "readAsDataURL");

        instance.onInputFileChange({preventDefault: vi.fn()});
        expect(preview.classList.contains("obj")).toEqual(true);
        expect(FileReader.prototype.readAsDataURL).toHaveBeenCalledWith(file);

        instance.hide();
        instance.show();
        instance.state.isAnimation = true;
        instance.show();
        instance.componentWillReceiveProps({user: {id: "new-user"}, userList: []} as any);
        expect(instance.state.userId).toEqual("new-user");
    });
});
