import {beforeEach, describe, expect, it, vi} from "vitest";

import {USER_LOAD_SUCCESS, USER_LOGIN_SUCCESS, USER_UPDATE_SUCCESS} from "./actionTypes";

describe("Testing ManageUser/actions.ts", () => {
    let getUser;
    let saveUser;
    let loginUser;
    let actions: typeof import("./actions").actionCreatorMapObject;

    beforeEach(async () => {
        getUser = vi.fn();
        saveUser = vi.fn();
        loginUser = vi.fn();

        vi.resetModules();
        vi.doMock("../../services/user.service", () => ({
            getUser,
            save: saveUser,
            login: loginUser
        }));

        actions = (await import("./actions")).actionCreatorMapObject;
    });

    it("save dispatches fetch start and login success for newly registered users", async () => {
        const
            dispatch = vi.fn(),
            user = {local: {email: "new@example.com"}},
            registerData = {id: "new-user", token: "new-token"};
        saveUser.mockResolvedValue(registerData);

        await actions.save(user)(dispatch);

        expect(dispatch).toHaveBeenNthCalledWith(1, {type: "FETCH_START"});
        expect(dispatch).toHaveBeenNthCalledWith(2, {
            type: USER_LOGIN_SUCCESS,
            user: {id: "new-user", local: {email: "new@example.com"}}
        });
    });

    it("save dispatches update success for existing users", async () => {
        const dispatch = vi.fn();
        saveUser.mockResolvedValue(null);

        await actions.save({id: "user-1"})(dispatch);

        expect(dispatch).toHaveBeenNthCalledWith(1, {type: "FETCH_START"});
        expect(dispatch).toHaveBeenNthCalledWith(2, {type: USER_UPDATE_SUCCESS});
    });

    it("save dispatches fetch error and rethrows failures", async () => {
        const
            dispatch = vi.fn(),
            error = new Error("save failed");
        saveUser.mockRejectedValue(error);

        await expect(actions.save({id: "user-1"})(dispatch)).rejects.toEqual(error);

        expect(dispatch).toHaveBeenNthCalledWith(1, {type: "FETCH_START"});
        expect(dispatch).toHaveBeenNthCalledWith(2, {type: "FETCH_ERROR"});
    });

    it("login dispatches fetch start and login success when service returns a user", async () => {
        const
            dispatch = vi.fn(),
            profile = {email: "user@example.com", password: "secret"},
            user = {id: "user-1"};
        loginUser.mockResolvedValue(user);

        await actions.login(profile)(dispatch);

        expect(dispatch).toHaveBeenNthCalledWith(1, {type: "FETCH_START"});
        expect(dispatch).toHaveBeenNthCalledWith(2, {type: USER_LOGIN_SUCCESS, user});
    });

    it("login dispatches fetch error and rethrows failures", async () => {
        const
            dispatch = vi.fn(),
            error = new Error("login failed");
        loginUser.mockRejectedValue(error);

        await expect(actions.login({email: "user@example.com"})(dispatch)).rejects.toEqual(error);

        expect(dispatch).toHaveBeenNthCalledWith(1, {type: "FETCH_START"});
        expect(dispatch).toHaveBeenNthCalledWith(2, {type: "FETCH_ERROR"});
    });

    it("loadUser dispatches fetch start and load success", async () => {
        const
            dispatch = vi.fn(),
            user = {id: "user-1"};
        getUser.mockResolvedValue(user);

        await actions.loadUser("user-1")(dispatch);

        expect(dispatch).toHaveBeenNthCalledWith(1, {type: "FETCH_START"});
        expect(dispatch).toHaveBeenNthCalledWith(2, {type: USER_LOAD_SUCCESS, user});
    });

    it("loadUser dispatches fetch error and rethrows failures", async () => {
        const
            dispatch = vi.fn(),
            error = new Error("load failed");
        getUser.mockRejectedValue(error);

        await expect(actions.loadUser("missing-user")(dispatch)).rejects.toEqual(error);

        expect(dispatch).toHaveBeenNthCalledWith(1, {type: "FETCH_START"});
        expect(dispatch).toHaveBeenNthCalledWith(2, {type: "FETCH_ERROR"});
    });
});
