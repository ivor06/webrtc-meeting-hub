import * as React from "react";
import {act, fireEvent, render, screen} from "@testing-library/react";
import {afterEach, beforeEach, describe, expect, it, Mock, vi} from "vitest";

describe("Testing Dialog.tsx", () => {
    let subscribeOn: Mock<(event: any, handler: any) => any>;
    let handlers: { [x: string]: (...args: any[]) => any; };
    let DialogComponent;

    beforeEach(async () => {
        handlers = {};
        subscribeOn = vi.fn((event, handler) => handlers[event] = handler);
        vi.useFakeTimers();

        vi.resetModules();
        vi.doMock("../../services/pubsub.service", () => ({subscribeOn}));

        DialogComponent = (await import("./Dialog")).Dialog;
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it("subscribes to dialog events and shows/hides content", () => {
        render(<DialogComponent content={{header: "Initial", text: "Initial text", isClosable: true}}/>);

        expect(subscribeOn).toHaveBeenCalledWith("Dialog.hide", expect.any(Function));
        expect(subscribeOn).toHaveBeenCalledWith("Dialog.show", expect.any(Function));
        expect(subscribeOn).toHaveBeenCalledWith("Dialog.setContent", expect.any(Function));
        expect(screen.queryByText("Initial text")).toEqual(null);

        act(() => handlers["Dialog.show"]());

        expect(screen.getByText("Initial text")).toBeTruthy();

        act(() => vi.advanceTimersByTime(100));

        expect(document.getElementById("myModal").className).toContain("show");

        act(() => handlers["Dialog.hide"]());
        act(() => vi.advanceTimersByTime(500));

        expect(screen.queryByText("Initial text")).toEqual(null);
    });

    it("sets content, calls content callback, and runs button callbacks", () => {
        const
            contentCallback = vi.fn(),
            buttonCallback = vi.fn();

        render(<DialogComponent/>);

        act(() => handlers["Dialog.setContent"]({
            header: "Updated",
            text: "Updated text",
            callBack: contentCallback,
            buttonList: [{label: "Confirm", callBack: buttonCallback}]
        }));
        act(() => handlers["Dialog.show"]());

        expect(screen.getByText("Updated")).toBeTruthy();
        expect(screen.getByText("Updated text")).toBeTruthy();

        fireEvent.click(screen.getByText("Confirm"));

        expect(contentCallback).toHaveBeenCalled();
        expect(buttonCallback).toHaveBeenCalled();
    });

    it("renders image, connection status, and error reload affordance", () => {
        render(
            <DialogComponent
                content={{
                    isError: true,
                    image: "/image.png",
                    text: "Image text",
                    connectionStatus: "Connecting"
                }}/>
        );

        act(() => handlers["Dialog.show"]());

        expect(screen.getByText("Error")).toBeTruthy();
        expect(screen.getByText("Image text")).toBeTruthy();
        expect(screen.getByText("Connecting")).toBeTruthy();
        expect(screen.getByText("Reload page")).toBeTruthy();
        expect((document.querySelector("img") as HTMLImageElement).src).toContain("/image.png");
    });
});
