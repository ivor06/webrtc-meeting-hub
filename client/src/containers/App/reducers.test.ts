import {describe, expect, it} from "vitest";

import {USER_LOGIN_SUCCESS, USER_LOGOUT_SUCCESS} from "./actionTypes";
import {countryListdReducer, userListReducer} from "./reducers";

describe("Testing App/reducers.ts", () => {
    it("countryListdReducer keeps existing state for all actions", () => {
        const state = [{ISO: "CA"}];

        expect(countryListdReducer(state, {type: "ANY"})).toBe(state);
        expect(countryListdReducer(undefined, {type: "INIT"})).toEqual([]);
    });

    it("userListReducer keeps existing state for login, logout, and unknown actions", () => {
        const state = [{id: "user-1"}];

        expect(userListReducer(state, {type: USER_LOGIN_SUCCESS})).toBe(state);
        expect(userListReducer(state, {type: USER_LOGOUT_SUCCESS})).toBe(state);
        expect(userListReducer(state, {type: "ANY"})).toBe(state);
        expect(userListReducer(undefined, {type: "INIT"})).toEqual([]);
    });
});
