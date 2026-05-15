import * as Router from "koa-router";

import {authRoutes, authAllowedMethods} from "./auth/index";
import {userRoutes, userAllowedMethods} from "./user/index";
import {geoRoutes, geoAllowedMethods} from "./geo/index";

const router = new Router();

router
    .use("/auth", authRoutes(), authAllowedMethods())
    .use("/user", userRoutes(), userAllowedMethods())
    .use("/geo", geoRoutes(), geoAllowedMethods());

const
    routes = () => router.routes(),
    allowedMethods = () => router.allowedMethods();

export {
    routes,
    allowedMethods
}
