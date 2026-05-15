import {UserInterface, Visit} from "../../common/interfaces/User";
import {HttpError} from "../../common/classes/HttpError";
import {
    localRegisterInit, localLoginInit, checkTokenInit, localRecoveryPassword
} from "./strategies/local";
import {updateVisitList} from "../providers/user";

export {
    localRegister,
    localToken,
    localLogin,
    localLogout,
    localRecoveryPassword
}

const RE_IP = /(?:.+:)?(\d+\.\d+\.\d+\.\d+)/;

async function localRegister(ctx) {

    const user: UserInterface = Object.assign(ctx.request.body, {
        visitList: [getVisit(ctx)]
    });

    ctx.status = 201;
    ctx.body = await localRegisterInit(user);
}

async function localLogin(ctx) {

    if (!ctx.request.body || !ctx.request.body.email || !ctx.request.body.password)
        throw new HttpError(400, "Bad request", "Email and password required");

    const
        email = ctx.request.body.email,
        password = ctx.request.body.password,
        user = await localLoginInit(email, password);

    await updateVisitList(user.id, getVisit(ctx));

    delete user.local.password;

    ctx.body = user;
}

async function localToken(ctx) {

    const user = await localCheckToken(ctx);

    delete user.local.password;
    delete user.local.token;

    await updateVisitList(user.id, getVisit(ctx));

    ctx.body = user;
}

async function localCheckToken(ctx) {

    const token = ctx.request.header.authorization ? ctx.request.header.authorization : null;

    if (!token)
        throw new HttpError(400, "Bad request", "Token required");

    const user = await checkTokenInit(token);

    return await user;
}

async function localLogout(ctx) {

    const token = ctx.request.header.authorization ? ctx.request.header.authorization : null;

    if (!token)
        throw new HttpError(400, "Bad request", "Token required");

    ctx.body = null;
}

function getVisit(ctx): Visit {

    const matchIp = (
        ctx.request.header['x-forwarded-for']
        || ctx.ip
        || ctx.remoteAddress
    ).match(RE_IP);

    return {
        ip: (matchIp && matchIp.length) ? matchIp[1] : null,
        userAgent: ctx.request.header["user-agent"],
        connectTime: new Date()
    };
}
