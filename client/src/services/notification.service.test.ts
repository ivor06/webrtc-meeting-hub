import {beforeEach, describe, expect, it, vi} from "vitest";

describe("Testing notification.service.ts", () => {
    let settings;
    let show;
    let service: typeof import("./notification.service");

    beforeEach(async () => {
        settings = vi.fn();
        show = vi.fn();

        vi.resetModules();
        vi.doMock("izitoast", () => ({settings, show}));
        service = await import("./notification.service");
    });

    it("configures izitoast on import", () => {
        expect(settings).toHaveBeenCalledWith({
            timeout: 10000,
            position: "topRight",
            resetOnHover: true,
            transitionIn: "fadeInUp",
            balloon: true
        });
    });

    it("shows error notifications with the error color", () => {
        service.notificationError("Failed");

        expect(show).toHaveBeenCalledWith({
            message: "Failed",
            backgroundColor: "#bd362f"
        });
    });

    it("shows success notifications with the success color", () => {
        service.notificationSuccess("Saved");

        expect(show).toHaveBeenCalledWith({
            message: "Saved",
            backgroundColor: "#51a351"
        });
    });
});
