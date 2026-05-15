import {Collection, ObjectID} from "mongodb";

import {collections, connectDb, replaceId} from "./db";
import {isEmptyObject, isString} from "../../common/util";
import {Country} from "../../common/interfaces/Country";
import {City} from "../../common/interfaces/City";
import {HashObject} from "../../common/interfaces/baseTypes";
import {Province} from "../../common/interfaces/Province";

export {
    findCountryById,
    findCityByIdList,

    findCountryByISO,
    findProvinceByISO,

    findProvincesByCountry,
    findCitiesByCountry,

    findCitiesByCountryAndProvince,

    findAllCountries,

    insertCountry,
    insertProvince,
    insertCity
}

let countries: Collection,
    provinces: Collection,
    cities: Collection,
    countryCache: Country[] = null;

const
    citiesCache: HashObject<City[]> = {},
    citiesByCountryISOCache: HashObject<City[]> = {},
    citiesByCountryAndProvinceISOCache: HashObject<HashObject<City[]>> = {},
    provincesByCountryISOCache: HashObject<Province[]> = {};

const
    COUNTRY_LIST_FIELDS = {
        "ISO": 1,
        "name": 1,
        "_id": 0
    },
    CITY_FIELDS = {
        "subdivisionName": 1,
        "subdivision2Name": 1,
        "name": 1
    },
    CITY_LIST_FIELDS = {
        "subdivision2Name": 1,
        "name": 1
    };

connectDb().then(() => {
    countries = collections["countries"];
    provinces = collections["provinces"];
    cities = collections["cities"];
});

function findCountryById(id: string): Promise<Country> {
    return countries
        .find({_id: new ObjectID(id)})
        .map(replaceId)
        .limit(1)
        .next()
        .then(country => isEmptyObject(country) ? null : country);
}

function findCountryByISO(ISO: string): Promise<Country> {
    return countries
        .find({ISO})
        .map(replaceId)
        .limit(1)
        .next()
        .then(country => isEmptyObject(country) ? null : country);
}

function findAllCountries(): Promise<Country[]> {
    return countryCache
        ? Promise.resolve(countryCache)
        : countries
            .find({})
            .project(COUNTRY_LIST_FIELDS)
            .toArray()
            .then(countryList => {
                countryCache = countryList;
                return countryList;
            });
}

function findProvinceByISO(countryISO: string, ISO: string): Promise<Province> {
    return provinces
        .find({countryISO, ISO})
        .project(COUNTRY_LIST_FIELDS)
        .limit(1)
        .next()
        .then(province => isEmptyObject(province) ? null : province);
}

function findCityByIdList(idList: string[] | string): Promise<City[]> {
    if (isString(idList))
        idList = [idList as string];

    const
        idsNeedData = {},
        cityList = (idList as string[]).map((id, index) => {
            const cityLocal = citiesCache[id] || null;
            if (!cityLocal)
                idsNeedData[id] = index;
            return cityLocal;
        });

    return (isEmptyObject(idsNeedData))
        ? Promise.resolve(cityList)
        : cities
            .find({_id: {$in: Object.keys(idsNeedData).map(id => new ObjectID(id))}})
            .project(CITY_FIELDS)
            .map(replaceId)
            .toArray()
            .then(cityListFromDb => {
                if (cityListFromDb.length > 0) {
                    cityListFromDb.forEach(city => {
                        citiesCache[city.id] = city;
                        cityList[idsNeedData[city.id]] = city;
                    });
                }
                return cityList;
            });
}

function findCitiesByCountry(countryISO: string): Promise<City[]> {
    return citiesByCountryISOCache[countryISO]
        ? Promise.resolve(citiesByCountryISOCache[countryISO])
        : cities
            .find({countryISO})
            .project(CITY_LIST_FIELDS)
            .map(replaceId)
            .toArray()
            .then(cityList => {
                citiesByCountryISOCache[countryISO] = cityList;
                return cityList;
            });
}

function findProvincesByCountry(countryISO: string): Promise<Province[]> {
    return provincesByCountryISOCache[countryISO]
        ? Promise.resolve(provincesByCountryISOCache[countryISO])
        : provinces
            .find({countryISO})
            .project(COUNTRY_LIST_FIELDS)
            .toArray()
            .then(provinceList => {
                provincesByCountryISOCache[countryISO] = provinceList;
                return provinceList;
            });
}

function findCitiesByCountryAndProvince(countryISO: string, provinceISO: string): Promise<City[]> {
    return citiesByCountryAndProvinceISOCache[countryISO] && citiesByCountryAndProvinceISOCache[countryISO][provinceISO]
        ? Promise.resolve(citiesByCountryAndProvinceISOCache[countryISO][provinceISO])
        : cities
            .find({countryISO, subdivisionISO: provinceISO})
            .project(CITY_LIST_FIELDS)
            .map(replaceId)
            .toArray()
            .then(cityList => {
                if (!citiesByCountryAndProvinceISOCache[countryISO])
                    citiesByCountryAndProvinceISOCache[countryISO] = {};
                citiesByCountryAndProvinceISOCache[countryISO][provinceISO] = cityList;
                return cityList;
            });
}

function insertCountry(country: Country): Promise<string> {
    return countries
        .insertOne(country)
        .then(result => (result.result.ok === 1) ? result.insertedId.toString() : null);
}

function insertCity(city: City): Promise<string> {
    return cities
        .insertOne(city)
        .then(result => (result.result.ok === 1) ? result.insertedId.toString() : null);
}

function insertProvince(province: Province): Promise<string> {
    return provinces
        .insertOne(province)
        .then(result => (result.result.ok === 1) ? result.insertedId.toString() : null);
}
