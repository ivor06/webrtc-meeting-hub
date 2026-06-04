import {afterEach, beforeEach, describe, expect, it, vi} from "vitest";

import {City} from "../../../common/interfaces/City";
import {Country} from "../../../common/interfaces/Country";
import {Province} from "../../../common/interfaces/Province";

describe("Testing localStorage.service.ts", () => {
    const originalLocalStorageDescriptor = Object.getOwnPropertyDescriptor(window, "localStorage");
    const originalConsoleError = console.error;

    let storage: Record<string, string>;
    let removeCalls: string[];
    let service: typeof import("./localStorage.service");

    beforeEach(async () => {
        storage = {};
        removeCalls = [];
        console.error = vi.fn();

        Object.defineProperty(window, "localStorage", {
            configurable: true,
            value: {
                getItem: (key: string) => key in storage ? storage[key] : null,
                setItem: (key: string, value: string) => storage[key] = value,
                removeItem: (key: string) => {
                    removeCalls.push(key);
                    delete storage[key];
                }
            }
        });

        vi.resetModules();
        service = await import("./localStorage.service");
    });

    afterEach(() => {
        if (originalLocalStorageDescriptor)
            Object.defineProperty(window, "localStorage", originalLocalStorageDescriptor);

        console.error = originalConsoleError;
        vi.resetModules();
    });

    it("stores, reads, and removes the local token", () => {
        service.setToken("token-1");

        expect(storage.localToken).toEqual("token-1");
        expect(service.getToken()).toEqual("token-1");

        service.setToken(null);

        expect(removeCalls).toEqual(["localToken"]);
        expect(service.getToken()).toEqual(null);
    });

    it("stores and reads country, province, city, and city-list caches", () => {
        const
            countries: Country[] = [{ISO: "CA", name: {en: "Canada"}}],
            provinces: Province[] = [{ISO: "ON", name: {en: "Ontario"}}],
            cities: City[] = [
                {id: "tor", name: {en: "Toronto"}},
                {id: "ott", name: {en: "Ottawa"}}
            ];

        service.setCountryList(countries);
        service.setProvinceListByCountry("CA", provinces);
        service.setCityById("tor", cities[0]);
        service.setCityList(cities);
        service.setCityListByCountry("CA", cities);
        service.setCityListByCountryAndProvince("CA", "ON", cities);

        expect(service.getCountryList()).toEqual(countries);
        expect(service.getProvinceListByCountry("CA")).toEqual(provinces);
        expect(service.getCityById("tor")).toEqual(cities[0]);
        expect(service.getCityById("ott")).toEqual(cities[1]);
        expect(service.getCityListByCountry("CA")).toEqual(cities);
        expect(service.getCityListByCountryAndProvince("CA", "ON")).toEqual(cities);
    });

    it("returns null and logs when cached JSON is malformed", () => {
        storage.countryList = "{not-json";
        storage["provinceList/CA"] = "{not-json";
        storage["city/tor"] = "{not-json";
        storage["cityList/CA"] = "{not-json";
        storage["cityList/CA/ON"] = "{not-json";

        expect(service.getCountryList()).toEqual(null);
        expect(service.getProvinceListByCountry("CA")).toEqual(null);
        expect(service.getCityById("tor")).toEqual(null);
        expect(service.getCityListByCountry("CA")).toEqual(null);
        expect(service.getCityListByCountryAndProvince("CA", "ON")).toEqual(null);
        expect(console.error).toHaveBeenCalledTimes(5);
    });
});
