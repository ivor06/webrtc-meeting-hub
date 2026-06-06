import {describe, expect, it} from "vitest";

import initialState, {blankUser} from "./initial";

describe("Testing store/initial.ts", () => {
    const userList = [
        {
            id: "with-name",
            org: {
                name: "Named Org",
                screenShot: "named-preview"
            }
        },
        {
            id: "without-name",
            org: {}
        }
    ] as any;

    it("defines blank user defaults", () => {
        expect(blankUser.local).toEqual({});
        expect(blankUser.org).toMatchObject({
            kind: 0,
            isNeedSendPaperInvoice: false,
            operatingTimeOpen: 8,
            operatingTimeClose: 23,
            camera: {
                hasSound: false,
                location: 0
            }
        });
    });

    it("returns organization names by user id with fallback values", () => {
        expect(initialState.getOrgNameById("with-name", userList)).toEqual("Named Org");
        expect(initialState.getOrgNameById("without-name", userList)).toEqual("Partner");
        expect(initialState.getOrgNameById("missing", userList)).toEqual(null);
    });

    it("returns screenshots by user id with fallback values", () => {
        expect(initialState.getUserScreenshotById("with-name", userList)).toEqual("named-preview");
        expect(initialState.getUserScreenshotById("without-name", userList)).toEqual("no-preview");
        expect(initialState.getUserScreenshotById("missing", userList)).toEqual(null);
    });
});
