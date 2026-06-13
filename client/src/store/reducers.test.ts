import {describe, expect, it} from "vitest";

import {rootReducer} from "./reducers";

describe("Testing store/reducers.ts", () => {
    it("creates the expected root state shape", () => {
        expect(Object.keys(rootReducer(undefined, {type: "INIT"}))).toEqual([
            "user",
            "userList",
            "countryList",
            "isLogged",
            "getOrgNameById",
            "getUserScreenshotById"
        ]);
    });

    it("delegates login and logout actions to child reducers", () => {
        const loggedInState = rootReducer(undefined, {
            type: "USER_LOGIN_SUCCESS",
            user: {
                id: "user-1",
                local: {
                    token: "secret"
                }
            }
        });

        expect(loggedInState.user).toEqual({id: "user-1", local: {}});
        expect(loggedInState.isLogged).toEqual(true);

        const loggedOutState = rootReducer(loggedInState, {type: "USER_LOGOUT_SUCCESS"});

        expect(loggedOutState.isLogged).toEqual(false);
        expect(loggedOutState.user).not.toHaveProperty("id");
    });
});
