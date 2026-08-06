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

    it("updates field values, applies transforms, and reloads dependent geo lists", () => {
        const {instance} = createInstance();

        instance.updateUserState({target: {name: "org.kind", value: "2", type: "select-one"}});
        instance.updateUserState({target: {name: "org.isNeedSendPaperInvoice", checked: true, type: "checkbox"}});
        instance.updateUserState({target: {name: "org.countryISO", value: "CA", type: "select-one"}});
        instance.updateUserState({target: {name: "org.provinceISO", value: "ON", type: "select-one"}});

        expect(instance.state.user.org.kind).toEqual(2);
        expect(instance.state.user.org.isNeedSendPaperInvoice).toEqual(true);
        expect(instance.state.currentCountryISO).toEqual("CA");
        expect(instance.state.currentProvinceISO).toEqual("ON");
        expect(getProvincesByCountry).toHaveBeenCalledWith("CA");
        expect(getCitiesByCountryAndProvince).toHaveBeenCalledWith("CA", "ON");
    });

    it("adds and clears field validation errors on blur", () => {
        const {instance} = createInstance();
        validateFormInput.mockReturnValueOnce([{message: "Invalid name"}]).mockReturnValueOnce([]);

        instance.onBlur({target: {name: "org.name"}});
        expect(instance.state.errors["org.name"]).toEqual("Invalid name");

        instance.onBlur({target: {name: "org.name"}});
        expect(instance.state.errors["org.name"]).toEqual(undefined);
    });

    it("saveUser reports validation errors without saving", () => {
        const
            {instance, props} = createInstance(),
            event = {preventDefault: vi.fn()};
        validateUser.mockReturnValue([{message: "Invalid user"}]);

        instance.saveUser(event);

        expect(event.preventDefault).toHaveBeenCalled();
        expect(notificationError).toHaveBeenCalledWith("Invalid user");
        expect(props.actions.save).not.toHaveBeenCalled();
    });

    it("saveUser saves, notifies, and navigates on success", async () => {
        const
            {instance, props} = createInstance(),
            event = {preventDefault: vi.fn()};

        instance.saveUser(event);
        await Promise.resolve();

        expect(props.actions.save).toHaveBeenCalledWith(instance.state.user);
        expect(notificationSuccess).toHaveBeenCalledWith("User saved");
        expect(props.navigate).toHaveBeenCalledWith("/");
        expect(instance.state.isSaving).toEqual(false);
    });

    it("login authenticates, notifies, and navigates on success", async () => {
        const
            {instance, props} = createInstance({routePath: "/signin"}),
            event = {preventDefault: vi.fn()};

        instance.login(event);
        await Promise.resolve();

        expect(props.actions.login).toHaveBeenCalledWith(instance.state.user.local);
        expect(notificationSuccess).toHaveBeenCalledWith("User logged in");
        expect(props.navigate).toHaveBeenCalledWith("/");
        expect(instance.state.isSaving).toEqual(false);
    });

    it("saveUser and login show mapped errors on failure", async () => {
        const
            saveError = new Error("Save failed"),
            loginError = new Error("Login failed"),
            saveCase = createInstance({
                actions: {
                    save: vi.fn(() => Promise.reject(saveError)),
                    login: vi.fn()
                }
            }),
            loginCase = createInstance({
                routePath: "/signin",
                actions: {
                    save: vi.fn(),
                    login: vi.fn(() => Promise.reject(loginError))
                }
            });

        saveCase.instance.saveUser({preventDefault: vi.fn()});
        await Promise.resolve();
        loginCase.instance.login({preventDefault: vi.fn()});
        await Promise.resolve();
        await Promise.resolve();

        expect(notificationError).toHaveBeenCalledWith("Save failed");
        expect(notificationError).toHaveBeenCalledWith("Login failed");
    });
});
