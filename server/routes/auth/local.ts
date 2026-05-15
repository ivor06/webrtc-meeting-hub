import * as Router from "koa-router";

import {localRegister, localLogin, localToken, localLogout} from "../../middleware/auth";

const localRouter = new Router();

localRouter
    .post("/register", localRegister)
    .post("/login", localLogin)
    .get("/token", localToken)
    .get("/logout", localLogout);

const
    localRoutes = () => localRouter.routes(),
    localAllowedMethods = () => localRouter.allowedMethods();

export {
    localRoutes,
    localAllowedMethods
}
