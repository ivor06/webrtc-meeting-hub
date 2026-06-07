import {beforeEach, describe, expect, it, vi} from "vitest";

import {USER_LOGIN_SUCCESS, USER_LOGOUT_SUCCESS} from "./actionTypes";

describe("Testing App/actions.ts", () => {
    let loginTokenUser;
    let logoutUser;
    let actions: typeof import("./actions").actionCreatorMapObject;

    beforeEach(async () => {
        loginTokenUser = vi.fn();
        logoutUser = vi.fn();

        vi.resetModules();
        vi.doMock("../../services/user.service", () => ({
            loginToken: loginTokenUser,
            logout: logoutUser
        }));

        actions = (await import("./actions")).actionCreatorMapObject;
    });

    it("loginToken dispatches login success when token login returns a user", async () => {
        const
            user = {id: "user-1"},
            dispatch = vi.fn();
        loginTokenUser.mockResolvedValue(user);

        await actions.loginToken()(dispatch);

        expect(dispatch).toHaveBeenCalledWith({type: USER_LOGIN_SUCCESS, user});
    });

    it("loginToken does not dispatch when token login returns no user", async () => {
        const dispatch = vi.fn();
        loginTokenUser.mockResolvedValue(null);

        await actions.loginToken()(dispatch);

        expect(dispatch).not.toHaveBeenCalled();
    });

    it("logout dispatches logout success on service success and failure", async () => {
        const dispatch = vi.fn();

        logoutUser.mockResolvedValueOnce(null);
        await actions.logout()(dispatch, vi.fn());

        logoutUser.mockRejectedValueOnce(new Error("logout failed"));
        await actions.logout()(dispatch, vi.fn());

        expect(dispatch).toHaveBeenNthCalledWith(1, {type: USER_LOGOUT_SUCCESS});
        expect(dispatch).toHaveBeenNthCalledWith(2, {type: USER_LOGOUT_SUCCESS});
    });
});
