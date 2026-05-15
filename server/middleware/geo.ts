import {ObjectID} from "mongodb";
import {HttpError} from "../../common/classes/HttpError";
import {
    findCityByIdList, findAllCountries, findCountryByISO,
    findProvinceByISO, findCitiesByCountry, findCitiesByCountryAndProvince, findProvincesByCountry
} from "../providers/geo";
import {isString} from "../../common/util";

export {
    getCityListById,
    getProvincesByCountry,
    getCitiesByCountry,
    getCitiesByCountryAndProvince,
    getAllCountries
}

async function getAllCountries(ctx) {

    ctx.body = await findAllCountries();
}

async function getCityListById(ctx) {
    if (!ctx.params || !ctx.params.idList || !isString(ctx.params.idList))
        throw new HttpError(400, "Bad request", "Cities Id list required");

    const idList = ctx.params.idList.split(";");

    try {
        idList.forEach(id => new ObjectID(id));
    } catch (e) {
        throw new HttpError(400, "Bad request", "Invalid city id");
    }

    const cityList = await findCityByIdList(idList);

    if (!cityList)
        throw new HttpError(404, "Not found", "Cities not found");

    ctx.body = cityList;
}

async function getProvincesByCountry(ctx) {
    if (!ctx.params || !ctx.params.countryISO)
        throw new HttpError(400, "Bad request", "Country ISO code required");

    const country = await findCountryByISO(ctx.params.countryISO);

    if (!country)
        throw new HttpError(400, "Bad request", "Invalid country ISO code");

    const provinceList = await findProvincesByCountry(ctx.params.countryISO);

    if (!provinceList)
        throw new HttpError(404, "Not found", "Provinces not found");

    ctx.body = provinceList;
}

async function getCitiesByCountry(ctx) {
    if (!ctx.params || !ctx.params.countryISO)
        throw new HttpError(400, "Bad request", "Country ISO code required");

    const country = await findCountryByISO(ctx.params.countryISO);

    if (!country)
        throw new HttpError(400, "Bad request", "Invalid country ISO code");

    const cityList = await findCitiesByCountry(ctx.params.countryISO);

    if (!cityList)
        throw new HttpError(404, "Not found", "Cities not found");

    ctx.body = cityList;
}

async function getCitiesByCountryAndProvince(ctx) {
    if (!ctx.params || !ctx.params.countryISO || !ctx.params.provinceISO)
        throw new HttpError(400, "Bad request", "Country and province ISO codes required");

    const country = await findCountryByISO(ctx.params.countryISO);

    if (!country)
        throw new HttpError(400, "Bad request", "Invalid country ISO code");

    const province = await findProvinceByISO(ctx.params.countryISO, ctx.params.provinceISO);

    if (!province)
        throw new HttpError(400, "Bad request", "Invalid province ISO code");

    const cityList = await findCitiesByCountryAndProvince(ctx.params.countryISO, ctx.params.provinceISO);

    if (!cityList)
        throw new HttpError(404, "Not found", "Cities not found");

    ctx.body = cityList;
}
