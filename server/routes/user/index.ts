import * as Router from "koa-router";

import {all, id} from "../../middleware/user";

const localRouter = new Router();

localRouter
    .get("/all", all)
    .get("/id/:id", id);

const
    userRoutes = () => localRouter.routes(),
    userAllowedMethods = () => localRouter.allowedMethods();

export {
    userRoutes,
    userAllowedMethods
}
