import * as Router from "koa-router";

import {countryRoutes, countryAllowedMethods} from "./country";
import {provinceRoutes, provinceAllowedMethods} from "./province";
import {cityRoutes, cityAllowedMethods} from "./city";

const geoRouter = new Router();

geoRouter
    .use("/country", countryRoutes(), countryAllowedMethods())
    .use("/province", provinceRoutes(), provinceAllowedMethods())
    .use("/city", cityRoutes(), cityAllowedMethods());

const
    geoRoutes = () => geoRouter.routes(),
    geoAllowedMethods = () => geoRouter.allowedMethods();

export {
    geoRoutes,
    geoAllowedMethods
}
