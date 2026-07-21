import {beforeEach, describe, expect, it, vi} from "vitest";

describe("Testing ManageUser.tsx", () => {
    let getProvincesByCountry;
    let getCitiesByCountry;
    let getCitiesByCountryAndProvince;
    let notificationError;
    let notificationSuccess;
    let validateUser;
    let validateLogin;
    let validateFormInput;
    let ManageUserComponent;

    const countryList = [
        {ISO: "US", name: {en: "United States"}},
        {ISO: "CA", name: {en: "Canada"}}
    ];

    const baseUser = () => ({
        id: "user-1",
        local: {
            email: "user@example.com",
            password: "secret",
            firstName: "Ada",
            lastName: "Lovelace"
        },
        org: {
            kind: 0,
            name: "Test Org",
            countryISO: "US",
            cityId: "nyc",
            address: "123 Test Street",
            zip: "12345",
            phone: "123-456-7890",
            isNeedSendPaperInvoice: false,
            operatingTimeOpen: 8,
            operatingTimeClose: 17,
            camera: {
                hasSound: false,
                location: 0
            },
            ageRestriction: 0
        }
    });

    const createInstance = (overrides: any = {}) => {
        const props = {
            user: baseUser(),
            countryList,
            routePath: "/signup",
            navigate: vi.fn(),
            actions: {
                save: vi.fn(() => Promise.resolve()),
                login: vi.fn(() => Promise.resolve())
            },
            ...overrides
        };
        const instance = new ManageUserComponent(props, null) as any;
        instance.setState = update => {
            const nextState = typeof update === "function" ? update(instance.state, instance.props) : update;
            instance.state = {...instance.state, ...nextState};
        };
        return {instance, props};
    };

    beforeEach(async () => {
        getProvincesByCountry = vi.fn(() => Promise.resolve([{ISO: "ON", name: {en: "Ontario"}}]));
        getCitiesByCountry = vi.fn(() => Promise.resolve([{id: "tor", name: {en: "Toronto"}}]));
        getCitiesByCountryAndProvince = vi.fn(() => Promise.resolve([{id: "ott", name: {en: "Ottawa"}}]));
        notificationError = vi.fn();
        notificationSuccess = vi.fn();
        validateUser = vi.fn(() => []);
        validateLogin = vi.fn(() => []);
        validateFormInput = vi.fn(() => []);

        vi.resetModules();
        vi.doMock("../../services/geo.service", () => ({
            getProvincesByCountry,
            getCitiesByCountry,
            getCitiesByCountryAndProvince
        }));
        vi.doMock("../../services/notification.service", () => ({notificationError, notificationSuccess}));
        vi.doMock("../../services/validation.service", () => ({
            registerPartialSchemaList: vi.fn(),
            validateUser,
            validateLogin,
            validateFormInput
        }));
        vi.doMock("../../services/error.service", () => ({
            getErrorMessage: error => error.message || "Mapped error"
        }));

        ManageUserComponent = (await import("./ManageUser")).ManageUser;
    });

    it("initializes login mode and loads province/city options", async () => {
        const {instance} = createInstance({routePath: "/signin"});

        await Promise.resolve();
        await Promise.resolve();

        expect(instance.state.isLogin).toEqual(true);
        expect(validateLogin).toHaveBeenCalled();
        expect(getProvincesByCountry).toHaveBeenCalledWith("US");
        expect(getCitiesByCountryAndProvince).toHaveBeenCalledWith("US", "ON");
        expect(instance.state.provinceOptionList).toEqual([{value: "ON", text: "Ontario"}]);
        expect(instance.state.cityOptionList).toEqual([{value: "ott", text: "Ottawa"}]);
    });
});
