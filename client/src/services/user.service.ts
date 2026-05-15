import axios, {AxiosRequestConfig} from "axios";

import {ProfileLocal, UserInterface} from "../../../common/interfaces/User";
import {HttpError} from "../../../common/classes/HttpError";
import {getToken, setToken} from "./localStorage.service";
import {setUserId} from "./message.service";
import {isContainsValue} from "../../../common/util";

export {
    getAll,
    getUser,
    save,
    login,
    logout,
    loginToken,
    uploadFile
}

const
    headers = {
        "Content-Type": "application/json"
    },
    getConfig = (isAuth?: boolean): AxiosRequestConfig => ({
        timeout: 2000,
        headers: isAuth ? Object.assign({
            Authorization: getToken()
        }, headers) : headers
    });

const userCache = {};

function getAll(): Promise<any> {
    return axios.get("/user/all")
        .then(response => response.data);
}

function getUser(id: string): Promise<UserInterface> {
    const userFromCache = userCache[id];
    return userFromCache
        ? Promise.resolve(userFromCache)
        : axios.get("/user/id/" + id)
            .then(response => {
                const user = response.data;
                userCache[id] = user;
                return user;
            })
            .catch(e => new HttpError(e.response.data.status));
}

function login(profile: ProfileLocal): Promise<UserInterface> {
    return axios.post("/auth/local/login", profile, getConfig())
        .then(response => {
            const user = response.data;
            setUser(user.id, user.local.token);
            return user;
        })
        .catch(e => new HttpError(e.response.data.status));
}

function loginToken(): Promise<UserInterface> {
    return axios.get("/auth/local/token", getConfig(true))
        .then(response => {
            setUser(response.data.id, null);
            return response.data;
        })
        .catch(e => {
            if (e.response && e.response.status && isContainsValue([400, 401], e.response.status))
                setToken(null);
            return (e.response && e.response.data.status)
                ? new HttpError(e.response.data.status, e.response.data.title, e.response.data.message)
                : e;
        });
}

function logout(): Promise<null> {
    return axios.get("/auth/local/logout", getConfig(true))
        .then(clearUser)
        .catch(clearUser);
}

function save(user: UserInterface): Promise<{ id: string, token: string }> {
    return axios.post(user.id
        ? "/auth/local/edit"
        : "/auth/local/register", user, getConfig(!!user.id))
        .then(response => {
            setToken(response.data.token || null);
            if (!user.id)
                setUserId(response.data.id);
            return user.id ? null : response.data;
        })
        .catch(e => (e.response && e.response.data.status)
            ? new HttpError(e.response.data.status, e.response.data.title, e.response.data.message)
            : e);
}

function uploadFile(file: any): Promise<any> {
    return axios
        .post("/user/upload", file, getConfig(true))
        .catch(e => new HttpError(e.response.data.status));
}

function clearUser() {
    setToken(null);
    setUserId(null);
}

function setUser(userId?: string, token?: string) {
    if (token)
        setToken(token);
    if (userId)
        setUserId(userId);
}
