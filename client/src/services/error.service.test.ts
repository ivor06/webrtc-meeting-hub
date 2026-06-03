import {describe, expect, it} from "vitest";

import {HttpError} from "../../../common/classes/HttpError";
import {getErrorMessage} from "./error.service";

describe("Testing error.service.ts", () => {
    it("returns mapped messages for known HttpError scopes and statuses", () => {
        expect(getErrorMessage(new HttpError(400), "user-register")).toEqual("All of form fields should be correct");
        expect(getErrorMessage(new HttpError(403), "user-register")).toEqual("This email registered already");
        expect(getErrorMessage(new HttpError(401), "user-login")).toEqual("Invalid password");
        expect(getErrorMessage(new HttpError(404), "user-login")).toEqual("User with specified email not found");
        expect(getErrorMessage(new HttpError(401), "user-token")).toEqual("User is not authorized");
        expect(getErrorMessage(new HttpError(404), "user-password-recover")).toEqual("User with specified email not found");
    });

    it("returns the default message for unknown HttpError mappings", () => {
        expect(getErrorMessage(new HttpError(500), "user-login")).toEqual("Error happened. Please try again or reload the page");
        expect(getErrorMessage(new HttpError(400), "unknown-scope")).toEqual("Error happened. Please try again or reload the page");
    });

    it("returns non-HttpError message fields or raw values", () => {
        expect(getErrorMessage(new Error("Network failed"), "user-login")).toEqual("Network failed");
        expect(getErrorMessage("Raw failure", "user-login")).toEqual("Raw failure");
    });
});
