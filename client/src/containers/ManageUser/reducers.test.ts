import {describe, expect, it} from "vitest";

import {USER_LOGIN_SUCCESS, USER_LOGOUT_SUCCESS, USER_REGISTER_SUCCESS} from "./actionTypes";
import {userIsLoggedReducer, userReducer} from "./reducers";
import initialState, {blankUser} from "../../store/initial";

describe("Testing ManageUser/reducers.ts", () => {
    it("userReducer stores logged-in users and removes local tokens", () => {
        const
            action = {
                type: USER_LOGIN_SUCCESS,
                user: {
                    id: "user-1",
                    local: {
                        email: "user@example.com",
                        token: "secret"
                    }
                }
            },
            result = userReducer(undefined, action);

        expect(result).toEqual({id: "user-1", local: {email: "user@example.com"}});
        expect(action.user.local).not.toHaveProperty("token");
    });

    it("userReducer handles register success and logout", () => {
        const registeredUser = {id: "user-2", local: {token: "secret"}} as any;

        expect(userReducer(undefined, {type: USER_REGISTER_SUCCESS, user: registeredUser})).toEqual({
            id: "user-2",
            local: {}
        });
        expect(userReducer({id: "user-2"} as any, {type: USER_LOGOUT_SUCCESS})).toEqual(blankUser);
    });

    it("userReducer returns current or initial state for unrelated actions", () => {
        const state = {id: "user-1"} as any;

        expect(userReducer(state, {type: "ANY"})).toBe(state);
        expect(userReducer(undefined, {type: "ANY"})).toEqual(initialState.user);
    });

    it("userIsLoggedReducer tracks login and logout status", () => {
        expect(userIsLoggedReducer(false, {type: USER_LOGIN_SUCCESS, user: {id: "user-1"}})).toEqual(true);
        expect(userIsLoggedReducer(true, {type: USER_LOGOUT_SUCCESS})).toEqual(false);
        expect(userIsLoggedReducer(true, {type: "ANY"})).toEqual(true);
        expect(userIsLoggedReducer(undefined, {type: "ANY"})).toEqual(initialState.isLogged);
    });
});
