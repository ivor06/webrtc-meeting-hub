import {beforeEach, describe, expect, it, vi} from "vitest";

import {ProfileLocal, UserInterface} from "../../../common/interfaces/User";

describe("Testing user.service.ts", () => {
    let axiosGet;
    let axiosPost;
    let getToken;
    let setToken;
    let setUserId;
    let service: typeof import("./user.service");
    let token: string;

    const authConfig = {
        timeout: 2000,
        headers: {
            Authorization: "local-token",
            "Content-Type": "application/json"
        }
    };

    const jsonConfig = {
        timeout: 2000,
        headers: {
            "Content-Type": "application/json"
        }
    };

    const user: UserInterface = {
        id: "user-1",
        local: {
            email: "user@example.com",
            token: "login-token"
        }
    };

    beforeEach(async () => {
        token = "local-token";
        axiosGet = vi.fn();
        axiosPost = vi.fn();
        getToken = vi.fn(() => token);
        setToken = vi.fn((newToken: string) => token = newToken);
        setUserId = vi.fn();

        vi.resetModules();
        vi.doMock("axios", () => {
            const axios = {
                get: axiosGet,
                post: axiosPost
            };

            return {
                default: axios,
                ...axios
            };
        });
        vi.doMock("./localStorage.service", () => ({getToken, setToken}));
        vi.doMock("./message.service", () => ({setUserId}));

        service = await import("./user.service");
    });

    it("getAll returns all users from Axios response data", async () => {
        const userList = [{id: "user-1"}, {id: "user-2"}];
        axiosGet.mockResolvedValue({data: userList});

        await expect(service.getAll()).resolves.toEqual(userList);
        expect(axiosGet).toHaveBeenCalledWith("/user/all");
    });

    it("getUser loads a user once and then returns it from cache", async () => {
        axiosGet.mockResolvedValue({data: user});

        await expect(service.getUser("user-1")).resolves.toEqual(user);
        await expect(service.getUser("user-1")).resolves.toEqual(user);

        expect(axiosGet).toHaveBeenCalledTimes(1);
        expect(axiosGet).toHaveBeenCalledWith("/user/id/user-1");
    });

    it("getUser returns HttpError when loading by id fails", async () => {
        axiosGet.mockRejectedValue({response: {data: {status: 404}}});

        const error = await service.getUser("missing-user") as any;

        expect(error.status).toEqual(404);
    });

    it("login posts credentials and stores returned user identity", async () => {
        const profile: ProfileLocal = {email: "user@example.com", password: "secret"};
        axiosPost.mockResolvedValue({data: user});

        await expect(service.login(profile)).resolves.toEqual(user);

        expect(axiosPost).toHaveBeenCalledWith("/auth/local/login", profile, jsonConfig);
        expect(setToken).toHaveBeenCalledWith("login-token");
        expect(setUserId).toHaveBeenCalledWith("user-1");
    });

    it("login returns HttpError when authentication fails", async () => {
        axiosPost.mockRejectedValue({response: {data: {status: 401}}});

        const error = await service.login({email: "user@example.com", password: "bad"}) as any;

        expect(error.status).toEqual(401);
    });

    it("loginToken authenticates with stored token and stores returned user id", async () => {
        const tokenUser = {id: "user-token"};
        axiosGet.mockResolvedValue({data: tokenUser});

        await expect(service.loginToken()).resolves.toEqual(tokenUser);

        expect(axiosGet).toHaveBeenCalledWith("/auth/local/token", authConfig);
        expect(setUserId).toHaveBeenCalledWith("user-token");
        expect(setToken).not.toHaveBeenCalled();
    });

    it("loginToken clears bad tokens and returns detailed HttpError", async () => {
        axiosGet.mockRejectedValue({
            response: {
                status: 401,
                data: {
                    status: 401,
                    title: "Unauthorized",
                    message: "Bad token"
                }
            }
        });

        const error = await service.loginToken() as any;

        expect(setToken).toHaveBeenCalledWith(null);
        expect(error.status).toEqual(401);
        expect(error.title).toEqual("Unauthorized");
        expect(error.message).toEqual("Bad token");
    });

    it("loginToken returns raw errors when response data is unavailable", async () => {
        const rawError = new Error("Network failed");
        axiosGet.mockRejectedValue(rawError);

        await expect(service.loginToken()).resolves.toEqual(rawError);
        expect(setToken).not.toHaveBeenCalled();
    });

    it("logout clears user identity on success and failure", async () => {
        axiosGet.mockResolvedValueOnce({data: null});
        await expect(service.logout()).resolves.toEqual(undefined);

        axiosGet.mockRejectedValueOnce(new Error("Logout failed"));
        await expect(service.logout()).resolves.toEqual(undefined);

        expect(axiosGet).toHaveBeenNthCalledWith(1, "/auth/local/logout", authConfig);
        expect(axiosGet).toHaveBeenNthCalledWith(2, "/auth/local/logout", {
            timeout: 2000,
            headers: {
                Authorization: null,
                "Content-Type": "application/json"
            }
        });
        expect(setToken).toHaveBeenCalledTimes(2);
        expect(setToken).toHaveBeenCalledWith(null);
        expect(setUserId).toHaveBeenCalledTimes(2);
        expect(setUserId).toHaveBeenCalledWith(null);
    });

    it("save registers new users, stores token, stores user id, and returns register data", async () => {
        const newUser = {local: {email: "new@example.com"}} as UserInterface;
        const registerData = {id: "new-user", token: "new-token"};
        axiosPost.mockResolvedValue({data: registerData});

        await expect(service.save(newUser)).resolves.toEqual(registerData);

        expect(axiosPost).toHaveBeenCalledWith("/auth/local/register", newUser, jsonConfig);
        expect(setToken).toHaveBeenCalledWith("new-token");
        expect(setUserId).toHaveBeenCalledWith("new-user");
    });

    it("save edits existing users with auth config and returns null", async () => {
        const existingUser = {id: "user-1", local: {email: "user@example.com"}} as UserInterface;
        axiosPost.mockResolvedValue({data: {}});

        await expect(service.save(existingUser)).resolves.toEqual(null);

        expect(axiosPost).toHaveBeenCalledWith("/auth/local/edit", existingUser, authConfig);
        expect(setToken).toHaveBeenCalledWith(null);
        expect(setUserId).not.toHaveBeenCalled();
    });

    it("save returns detailed HttpError on API validation errors", async () => {
        axiosPost.mockRejectedValue({
            response: {
                data: {
                    status: 403,
                    title: "Forbidden",
                    message: "Email already exists"
                }
            }
        });

        const error = await service.save({local: {email: "taken@example.com"}} as UserInterface) as any;

        expect(error.status).toEqual(403);
        expect(error.title).toEqual("Forbidden");
        expect(error.message).toEqual("Email already exists");
    });

    it("save returns raw errors when API error data is unavailable", async () => {
        const rawError = new Error("Save failed");
        axiosPost.mockRejectedValue(rawError);

        await expect(service.save({local: {email: "new@example.com"}} as UserInterface)).resolves.toEqual(rawError);
    });

    it("uploadFile posts form data with auth config", async () => {
        const formData = {file: "avatar"} as any;
        const uploadResponse = {data: {fileName: "avatar.png"}};
        axiosPost.mockResolvedValue(uploadResponse);

        await expect(service.uploadFile(formData)).resolves.toEqual(uploadResponse);

        expect(axiosPost).toHaveBeenCalledWith("/user/upload", formData, authConfig);
    });

    it("uploadFile returns HttpError when upload fails", async () => {
        axiosPost.mockRejectedValue({response: {data: {status: 500}}});

        const error = await service.uploadFile({file: "avatar"} as any) as any;

        expect(error.status).toEqual(500);
    });
});
