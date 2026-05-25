const {expect} = require("expect");

describe("Testing geo.service.ts", () => {
    const originalWindow = global.window;
    const originalFetch = global.fetch;

    let fetchCalls;
    let fetchResponse;
    let axiosCalls;
    let axiosResponse;
    let originalAxiosGet;
    let storage;

    beforeEach(() => {
        fetchCalls = [];
        fetchResponse = null;
        axiosCalls = [];
        axiosResponse = null;
        storage = {};

        const axiosModule = require("axios");
        const axios = axiosModule.default || axiosModule;
        originalAxiosGet = axios.get;
        axios.get = url => {
            axiosCalls.push(url);
            return Promise.resolve(axiosResponse);
        };

        global.window = {
            localStorage: {
                getItem: key => storage[key] || null,
                setItem: (key, value) => storage[key] = value,
                removeItem: key => delete storage[key]
            }
        };

        global.fetch = url => {
            fetchCalls.push(url);
            return Promise.resolve(fetchResponse);
        };

        delete require.cache[require.resolve("./geo.service.ts")];
        delete require.cache[require.resolve("./localStorage.service.ts")];
    });

    afterEach(() => {
        const axiosModule = require("axios");
        const axios = axiosModule.default || axiosModule;
        axios.get = originalAxiosGet;

        global.window = originalWindow;
        global.fetch = originalFetch;

        delete require.cache[require.resolve("./geo.service.ts")];
        delete require.cache[require.resolve("./localStorage.service.ts")];
    });

    it("getAllCountries loads countries with fetch, sorts them, and stores them locally", async () => {
        fetchResponse = {
            ok: true,
            json: () => Promise.resolve([
                {ISO: "US", name: {en: "United States"}},
                {ISO: "CA", name: {en: "Canada"}}
            ])
        };

        const {getAllCountries} = require("./geo.service.ts");

        const countryList = await getAllCountries();

        expect(fetchCalls).toEqual(["/geo/country/all"]);
        expect(countryList.map(country => country.ISO)).toEqual(["CA", "US"]);
        expect(JSON.parse(storage.countryList).map(country => country.ISO)).toEqual(["CA", "US"]);
    });

    it("getAllCountries returns locally stored countries without fetching", async () => {
        storage.countryList = JSON.stringify([
            {ISO: "CA", name: {en: "Canada"}}
        ]);

        const {getAllCountries} = require("./geo.service.ts");

        const countryList = await getAllCountries();

        expect(fetchCalls).toEqual([]);
        expect(countryList.map(country => country.ISO)).toEqual(["CA"]);
    });

    it("getAllCountries rejects failed fetch responses", async () => {
        fetchResponse = {
            ok: false,
            json: () => Promise.resolve([])
        };

        const {getAllCountries} = require("./geo.service.ts");

        await expect(getAllCountries()).rejects.toThrow("Failed to load countries");
    });

    it("getCitiesByCountry loads cities with Axios, sorts them, and stores them locally", async () => {
        axiosResponse = {
            data: [
                {id: "nyc", name: {en: "New York"}},
                {id: "bos", name: {en: "Boston"}}
            ]
        };

        const {getCitiesByCountry} = require("./geo.service.ts");

        const cityList = await getCitiesByCountry("US");

        expect(axiosCalls).toEqual(["/geo/city/byCountry/US"]);
        expect(cityList.map(city => city.id)).toEqual(["bos", "nyc"]);
        expect(JSON.parse(storage["cityList/US"]).map(city => city.id)).toEqual(["bos", "nyc"]);
    });

    it("getCitiesByCountry returns locally stored cities without Axios", async () => {
        storage["cityList/US"] = JSON.stringify([
            {id: "bos", name: {en: "Boston"}}
        ]);

        const {getCitiesByCountry} = require("./geo.service.ts");

        const cityList = await getCitiesByCountry("US");

        expect(axiosCalls).toEqual([]);
        expect(cityList.map(city => city.id)).toEqual(["bos"]);
    });

    it("getCitiesByCountryAndProvince loads cities with Axios, sorts them, and stores them locally", async () => {
        axiosResponse = {
            data: [
                {id: "la", name: {en: "Los Angeles"}},
                {id: "ana", name: {en: "Anaheim"}}
            ]
        };

        const {getCitiesByCountryAndProvince} = require("./geo.service.ts");

        const cityList = await getCitiesByCountryAndProvince("US", "CA");

        expect(axiosCalls).toEqual(["/geo/city/byCountryProvince/US/CA"]);
        expect(cityList.map(city => city.id)).toEqual(["ana", "la"]);
        expect(JSON.parse(storage["cityList/US/CA"]).map(city => city.id)).toEqual(["ana", "la"]);
    });

    it("getCitiesByCountryAndProvince returns locally stored cities without Axios", async () => {
        storage["cityList/US/CA"] = JSON.stringify([
            {id: "ana", name: {en: "Anaheim"}}
        ]);

        const {getCitiesByCountryAndProvince} = require("./geo.service.ts");

        const cityList = await getCitiesByCountryAndProvince("US", "CA");

        expect(axiosCalls).toEqual([]);
        expect(cityList.map(city => city.id)).toEqual(["ana"]);
    });
});
