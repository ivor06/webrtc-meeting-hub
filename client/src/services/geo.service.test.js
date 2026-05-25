const {expect} = require("expect");
const { getAllCountries, getCitiesByCountryAndProvince } = require("./geo.service.ts");

describe("Testing geo.service.ts", () => {
    const originalWindow = global.window;
    const originalFetch = global.fetch;

    let fetchCalls;
    let fetchResponse;
    let storage;

    beforeEach(() => {
        fetchCalls = [];
        fetchResponse = null;
        storage = {};

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

        const countryList = await getAllCountries();

        expect(fetchCalls).toEqual(["/geo/country/all"]);
        expect(countryList.map(country => country.ISO)).toEqual(["CA", "US"]);
        expect(JSON.parse(storage.countryList).map(country => country.ISO)).toEqual(["CA", "US"]);
    });

    it("getAllCountries returns locally stored countries without fetching", async () => {
        storage.countryList = JSON.stringify([
            {ISO: "CA", name: {en: "Canada"}}
        ]);

        const countryList = await getAllCountries();

        expect(fetchCalls).toEqual([]);
        expect(countryList.map(country => country.ISO)).toEqual(["CA"]);
    });

    it("getAllCountries rejects failed fetch responses", async () => {
        fetchResponse = {
            ok: false,
            json: () => Promise.resolve([])
        };

        await expect(getAllCountries()).rejects.toThrow("Failed to load countries");
    });

    it("getCitiesByCountryAndProvince loads cities by country with axios, sorts them, and stores them locally", async () => {
        fetchResponse = {
            ok: true,
            json: () => Promise.resolve([
                {id: "bangkok", countryISO: "TH", name: {en: "Bangkok"}},
                {id: "kuala-lumpur", countryISO: "ML", name: {en: "Kuala Lumpur"}}
            ])
        };

        const cities = await getCitiesByCountryAndProvince();

        expect(fetchCalls).toEqual(["/geo/city/byCountryProvince"]);
        expect(cities.map(city => city.id)).toEqual(["bangkok", "kuala-lumpur"]);
        expect(JSON.parse(storage.cityList).map(city => city.id)).toEqual(["bangkok", "kuala-lumpur"]);
    });

    it("getCitiesByCountryAndProvince returns locally stored cities without fetching", async () => {
        storage.cityList = JSON.stringify([
            {id: "kuala-lumpur", countryISO: "ML", name: {en: "Kuala Lumpur"}}
        ]);

        const cities = await getCitiesByCountryAndProvince();

        expect(fetchCalls).toEqual([]);
        expect(cities.map(city => city.id)).toEqual(["kuala-lumpur"]);
    });
});
