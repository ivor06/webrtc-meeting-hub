import * as Router from "koa-router";

import {getProvincesByCountry} from "../../middleware/geo";

const ProvinceRouter = new Router();

ProvinceRouter
    .get("/byCountry/:countryISO", getProvincesByCountry);

const
    provinceRoutes = () => ProvinceRouter.routes(),
    provinceAllowedMethods = () => ProvinceRouter.allowedMethods();

export {
    provinceRoutes,
    provinceAllowedMethods
}
