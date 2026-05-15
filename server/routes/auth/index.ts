import * as Router from "koa-router";

import {localAllowedMethods, localRoutes} from "./local";

const authRouter = new Router();

authRouter
    .use("/local", localRoutes(), localAllowedMethods());

const
    authRoutes = () => authRouter.routes(),
    authAllowedMethods = () => authRouter.allowedMethods();

export {
    authRoutes,
    authAllowedMethods
}
