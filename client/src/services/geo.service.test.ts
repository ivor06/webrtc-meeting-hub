import {afterEach, beforeEach, describe, expect, it, vi} from "vitest";

import {City} from "../../../common/interfaces/City";
import {Country} from "../../../common/interfaces/Country";

describe("Testing geo.service.ts", () => {
    const originalLocalStorageDescriptor = Object.getOwnPropertyDescriptor(window, "localStorage");
    const originalFetch = globalThis.fetch;

    let fetchCalls: string[];
    let fetchResponse: {
        ok: boolean;
        json: () => Promise<Country[]>;
    };
    let axiosCalls: string[];
    let axiosResponse: {
        data: City[];
    };
    let storage: Record<string, string>;

    beforeEach(() => {
        fetchCalls = [];
        fetchResponse = null;
        axiosCalls = [];
        axiosResponse = null;
        storage = {};

        vi.resetModules();
        vi.doMock("axios", () => {
            const axios = {
                get: (url: string) => {
                    axiosCalls.push(url);
                    return Promise.resolve(axiosResponse);
                }
            };

            return {
                default: axios,
                ...axios
            };
        });

        Object.defineProperty(window, "localStorage", {
            configurable: true,
            value: {
                getItem: (key: string) => storage[key] || null,
                setItem: (key: string, value: string) => storage[key] = value,
                removeItem: (key: string) => delete storage[key]
            }
        });

        globalThis.fetch = ((url: string) => {
            fetchCalls.push(url);
            return Promise.resolve(fetchResponse);
        }) as any;
    });

    afterEach(() => {
        if (originalLocalStorageDescriptor)
            Object.defineProperty(window, "localStorage", originalLocalStorageDescriptor);

        globalThis.fetch = originalFetch;
        vi.doUnmock("axios");
        vi.resetModules();
    });

    it("getAllCountries loads countries with fetch, sorts them, and stores them locally", async () => {
        fetchResponse = {
            ok: true,
            json: () => Promise.resolve([
                {ISO: "US", name: {en: "United States"}},
                {ISO: "CA", name: {en: "Canada"}}
            ])
        };

        const {getAllCountries} = await import("./geo.service");

        const countryList = await getAllCountries();

        expect(fetchCalls).toEqual(["/geo/country/all"]);
        expect(countryList.map((country: Country) => country.ISO)).toEqual(["CA", "US"]);
        expect(JSON.parse(storage.countryList).map((country: Country) => country.ISO)).toEqual(["CA", "US"]);
    });

    it("getAllCountries returns locally stored countries without fetching", async () => {
        storage.countryList = JSON.stringify([
            {ISO: "CA", name: {en: "Canada"}}
        ]);

        const {getAllCountries} = await import("./geo.service");

        const countryList = await getAllCountries();

        expect(fetchCalls).toEqual([]);
        expect(countryList.map((country: Country) => country.ISO)).toEqual(["CA"]);
    });

    it("getAllCountries rejects failed fetch responses", async () => {
        fetchResponse = {
            ok: false,
            json: () => Promise.resolve([])
        };

        const {getAllCountries} = await import("./geo.service");

        await expect(getAllCountries()).rejects.toThrow("Failed to load countries");
    });

    it("getCitiesByCountry loads cities with Axios, sorts them, and stores them locally", async () => {
        axiosResponse = {
            data: [
                {id: "nyc", name: {en: "New York"}},
                {id: "bos", name: {en: "Boston"}}
            ]
        };

        const {getCitiesByCountry} = await import("./geo.service");

        const cityList = await getCitiesByCountry("US");

        expect(axiosCalls).toEqual(["/geo/city/byCountry/US"]);
        expect(cityList.map((city: City) => city.id)).toEqual(["bos", "nyc"]);
        expect(JSON.parse(storage["cityList/US"]).map((city: City) => city.id)).toEqual(["bos", "nyc"]);
    });

    it("getCitiesByCountry returns locally stored cities without Axios", async () => {
        storage["cityList/US"] = JSON.stringify([
            {id: "bos", name: {en: "Boston"}}
        ]);

        const {getCitiesByCountry} = await import("./geo.service");

        const cityList = await getCitiesByCountry("US");

        expect(axiosCalls).toEqual([]);
        expect(cityList.map((city: City) => city.id)).toEqual(["bos"]);
    });

    it("getCitiesByCountryAndProvince loads cities with Axios, sorts them, and stores them locally", async () => {
        axiosResponse = {
            data: [
                {id: "la", name: {en: "Los Angeles"}},
                {id: "ana", name: {en: "Anaheim"}}
            ]
        };

        const {getCitiesByCountryAndProvince} = await import("./geo.service");

        const cityList = await getCitiesByCountryAndProvince("US", "CA");

        expect(axiosCalls).toEqual(["/geo/city/byCountryProvince/US/CA"]);
        expect(cityList.map((city: City) => city.id)).toEqual(["ana", "la"]);
        expect(JSON.parse(storage["cityList/US/CA"]).map((city: City) => city.id)).toEqual(["ana", "la"]);
    });

    it("getCitiesByCountryAndProvince returns locally stored cities without Axios", async () => {
        storage["cityList/US/CA"] = JSON.stringify([
            {id: "ana", name: {en: "Anaheim"}}
        ]);

        const {getCitiesByCountryAndProvince} = await import("./geo.service");

        const cityList = await getCitiesByCountryAndProvince("US", "CA");

        expect(axiosCalls).toEqual([]);
        expect(cityList.map((city: City) => city.id)).toEqual(["ana"]);
    });
});
