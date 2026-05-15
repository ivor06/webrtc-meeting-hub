import * as Router from "koa-router";

import {getCityListById, getCitiesByCountry, getCitiesByCountryAndProvince} from "../../middleware/geo";

const cityRouter = new Router();

cityRouter
    .get("/byIdList/:idList", getCityListById)
    .get("/byCountry/:countryISO", getCitiesByCountry)
    .get("/byCountryProvince/:countryISO/:provinceISO", getCitiesByCountryAndProvince);

const
    cityRoutes = () => cityRouter.routes(),
    cityAllowedMethods = () => cityRouter.allowedMethods();

export {
    cityRoutes,
    cityAllowedMethods
}
