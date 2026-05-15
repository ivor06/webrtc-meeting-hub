import * as Router from "koa-router";

import {getAllCountries} from "../../middleware/geo";

const countryRouter = new Router();

countryRouter
    .get("/all", getAllCountries);

const
    countryRoutes = () => countryRouter.routes(),
    countryAllowedMethods = () => countryRouter.allowedMethods();

export {
    countryRoutes,
    countryAllowedMethods
}
