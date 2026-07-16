import * as React from "react";
import {act, render, screen} from "@testing-library/react";
import {beforeEach, describe, expect, it, Mock, vi} from "vitest";

describe("Testing Dialog.tsx", () => {
    let subscribeOn: Mock<(event: any, handler: any) => any>;
    let handlers: { [x: string]: () => any; };
    let DialogComponent;

    beforeEach(async () => {
        handlers = {};
        subscribeOn = vi.fn((event, handler) => handlers[event] = handler);
        vi.useFakeTimers();

        vi.resetModules();
        vi.doMock("../../services/pubsub.service", () => ({subscribeOn}));

        DialogComponent = (await import("./Dialog")).Dialog;
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
});
