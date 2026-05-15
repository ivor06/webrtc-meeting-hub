import axios from "axios";

import {
    getCountryList, setCountryList,
    getProvinceListByCountry, setProvinceListByCountry,
    getCityById as getLocalCityById, setCityById,
    setCityList,
    getCityListByCountry, setCityListByCountry,
    getCityListByCountryAndProvince, setCityListByCountryAndProvince
} from "./localStorage.service";
import {DEFAULT_LANGUAGE} from "../config/config";
import {Country} from "../../../common/interfaces/Country";
import {City} from "../../../common/interfaces/City";
import {Province} from "../../../common/interfaces/Province";
import {isEmptyObject} from "../../../common/util";

export {
    getAllCountries,
    getCountryByIso,
    getProvincesByCountry,
    getCityById,
    getCityListByIdList,
    getCitiesByIdList,
    getCitiesByCountry,
    getCitiesByCountryAndProvince
}

const sortByName = (item1, item2) => item1.name[DEFAULT_LANGUAGE].localeCompare(item2.name[DEFAULT_LANGUAGE]);

function getAllCountries(): Promise<Country[]> {
    const countryListLocal = getCountryList();
    return countryListLocal
        ? Promise.resolve(countryListLocal)
        : axios.get("/geo/country/all")
            .then(response => {
                const countryList = response.data.sort(sortByName);
                setCountryList(countryList);
                return countryList;
            });
}

function getCountryByIso(ISO: string): Country {
    return getCountryList().find(country => country.ISO === ISO);
}

function getProvincesByCountry(countryISO: string): Promise<Province[]> {
    const provinceListLocal = getProvinceListByCountry(countryISO);
    return provinceListLocal
        ? Promise.resolve(provinceListLocal)
        : axios.get("/geo/province/byCountry/" + countryISO)
            .then(response => {
                const provinceList = response.data.sort(sortByName);
                setProvinceListByCountry(countryISO, provinceList);
                return provinceList;
            });
}

function getCitiesByCountry(ISO: string): Promise<City[]> {
    const cityListLocal = getCityListByCountry(ISO);
    return cityListLocal
        ? Promise.resolve(cityListLocal)
        : axios.get("/geo/city/byCountry/" + ISO)
            .then(response => {
                const cityList = response.data.sort(sortByName);
                setCityListByCountry(ISO, cityList);
                return cityList;
            });
}

function getCityById(id: string): Promise<City> {
    const cityLocal = getLocalCityById(id);
    return cityLocal
        ? Promise.resolve(cityLocal)
        : axios.get("/geo/city/byId/" + id)
            .then(response => {
                const city = response.data;
                setCityById(id, city);
                return city;
            });
}

function getCityListByIdList(idList: string[]): Promise<City[]> {
    const
        idsNeedData = {},
        cityList = idList.map((id, index) => {
            const cityLocal = getLocalCityById(id) || null;
            if (!cityLocal)
                idsNeedData[id] = index;
            return cityLocal;
        });

    return isEmptyObject(idsNeedData)
        ? Promise.resolve(cityList)
        : axios.get("/geo/city/byIdList/" + Object.keys(idsNeedData).join(";"))
            .then(response => {
                const cityListFromServer = response.data;
                cityListFromServer.forEach(city => cityList[idsNeedData[city.id]] = city);
                setCityList(cityListFromServer);
                return cityList;
            });
}

function getCitiesByIdList(idList: string[]): Promise<City[]> {
    const
        idNeedDataList = [],
        cities = {};

    idList.forEach(id => {
        const cityLocal = getLocalCityById(id) || null;
        if (!cityLocal)
            idNeedDataList.push(id);
        cities[id] = cityLocal;
    });

    return (idNeedDataList.length === 0)
        ? Promise.resolve(cities)
        : axios.get("/geo/city/byIdList/" + idNeedDataList.join(";"))
            .then(response => {
                const cityListFromServer = response.data;
                cityListFromServer.forEach(city => cities[city.id] = city);
                setCityList(cityListFromServer);
                return cities;
            });
}

function getCitiesByCountryAndProvince(countryISO: string, provinceISO: string): Promise<City[]> {
    const cityListLocal = getCityListByCountryAndProvince(countryISO, provinceISO);
    return cityListLocal
        ? Promise.resolve(cityListLocal)
        : axios.get("/geo/city/byCountryProvince/" + countryISO + "/" + provinceISO)
            .then(response => {
                const cityList = response.data.sort(sortByName);
                setCityListByCountryAndProvince(countryISO, provinceISO, cityList);
                return cityList;
            });
}
