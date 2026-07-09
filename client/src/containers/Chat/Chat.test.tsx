import * as React from "react";
import {render, screen} from "@testing-library/react";
import {beforeEach, describe, expect, it, Mock, vi} from "vitest";

describe("Testing Chat.tsx", () => {
    let publishEvent: Mock;
    let subscribeOn: Mock<(event: any, handler: any) => any>;
    let sendMessage: Mock<() => Promise<{ id: string; time: Date; }>>;
    let handlers: { [x: string]: any; };
    let ChatComponent;

    beforeEach(async () => {
        publishEvent = vi.fn();
        handlers = {};
        subscribeOn = vi.fn((event, handler) => handlers[event] = handler);
        sendMessage = vi.fn(() => Promise.resolve({id: "message-1", time: new Date()}));

        vi.resetModules();
        vi.doMock("../../services/pubsub.service", () => ({publishEvent, subscribeOn}));
        vi.doMock("../../services/message.service", () => ({sendMessage}));

        ChatComponent = (await import("./Chat")).Chat;
    });

    const renderChat = () => render(
        <ChatComponent
            user={{id: "self-user"}}
            selfUserId="self-user"
            remoteUserId="remote-user"/>
    );

    it("subscribes to message events and renders empty state", () => {
        renderChat();

        expect(subscribeOn).toHaveBeenCalledWith("message", expect.any(Function));
        expect(subscribeOn).toHaveBeenCalledWith("message-delivered", expect.any(Function));
        expect(screen.getByText("No messages yet")).toBeTruthy();
    });
});
