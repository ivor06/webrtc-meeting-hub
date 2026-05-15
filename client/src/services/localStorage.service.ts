import {Country} from "../../../common/interfaces/Country";
import {City} from "../../../common/interfaces/City";
import {Province} from "../../../common/interfaces/Province";
export {
    getToken,
    setToken,
    getCountryList,
    setCountryList,
    getProvinceListByCountry,
    setProvinceListByCountry,
    getCityById,
    setCityById,
    setCityList,
    getCityListByCountry,
    setCityListByCountry,
    getCityListByCountryAndProvince,
    setCityListByCountryAndProvince
}

const localStorage = window.localStorage;

function getToken(): string {
    return localStorage ? localStorage.getItem("localToken") : null;
}

function setToken(token: string) {
    if (token !== null)
        localStorage.setItem("localToken", token);
    else
        localStorage.removeItem("localToken");
}

function getCountryList() {
    if (!localStorage)
        return null;
    let countryList: Country[] = null;
    try {
        countryList = JSON.parse(localStorage.getItem("countryList"));
    } catch (e) {
        console.error(e);
    }

    return countryList;
}

function setCountryList(countryList: Country[]) {
    localStorage.setItem("countryList", JSON.stringify(countryList));
}

function getProvinceListByCountry(countryISO: string) {
    if (!localStorage)
        return null;
    let provinceList: Province[] = null;
    try {
        provinceList = JSON.parse(localStorage.getItem("provinceList/" + countryISO));
    } catch (e) {
        console.error(e);
    }

    return provinceList;
}

function setProvinceListByCountry(countryISO: string, provinceList: Province[]) {
    localStorage.setItem("provinceList/" + countryISO, JSON.stringify(provinceList));
}

function getCityById(id: string): City {
    if (!localStorage)
        return null;
    let city: City = null;
    try {
        city = JSON.parse(localStorage.getItem("city/" + id));
    } catch (e) {
        console.error(e);
    }

    return city;
}

function setCityById(id: string, city: City) {
    localStorage.setItem("city/" + id, JSON.stringify(city));
}

function setCityList(cityList: City[]) {
    cityList.forEach(city => localStorage.setItem("city/" + city.id, JSON.stringify(city)));
}

function getCityListByCountry(countryISO: string): City[] {
    if (!localStorage)
        return null;
    let cityList: City[] = null;
    try {
        cityList = JSON.parse(localStorage.getItem("cityList/" + countryISO));
    } catch (e) {
        console.error(e);
    }

    return cityList;
}

function setCityListByCountry(countryISO: string, cityList: City[]) {
    localStorage.setItem("cityList/" + countryISO, JSON.stringify(cityList));
}

function getCityListByCountryAndProvince(countryISO: string, provinceISO: string) {
    if (!localStorage)
        return null;
    let cityList: City[] = null;
    try {
        cityList = JSON.parse(localStorage.getItem("cityList/" + countryISO + "/" + provinceISO));
    } catch (e) {
        console.error(e);
    }

    return cityList;
}

function setCityListByCountryAndProvince(countryISO: string, provinceISO: string, cityList: City[]) {
    localStorage.setItem("cityList/" + countryISO + "/" + provinceISO, JSON.stringify(cityList));
}
