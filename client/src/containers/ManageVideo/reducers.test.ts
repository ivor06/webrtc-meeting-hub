import {describe, expect, it} from "vitest";

import {getUserNameByIdReducer, getUserScreenshotByIdReducer} from "./reducers";
import initialState from "../../store/initial";

describe("Testing ManageVideo/reducers.ts", () => {
    it("getUserNameByIdReducer returns selector function state", () => {
        const selector = () => "Custom";

        expect(getUserNameByIdReducer(undefined)).toBe(initialState.getOrgNameById);
        expect(getUserNameByIdReducer(selector)).toBe(selector);
    });

    it("getUserScreenshotByIdReducer returns selector function state", () => {
        const selector = () => "custom-preview";

        expect(getUserScreenshotByIdReducer(undefined)).toBe(initialState.getUserScreenshotById);
        expect(getUserScreenshotByIdReducer(selector)).toBe(selector);
    });
});
