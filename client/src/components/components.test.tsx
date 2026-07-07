import * as React from "react";
import {fireEvent, render, screen, within} from "@testing-library/react";
import {beforeEach, describe, expect, it, vi} from "vitest";
import {CITIES, COUNTRIES} from "../../../common/dictionaries/geo.dictionary";
import {CAMERA_LOCATION} from "../../../common/interfaces/User";
import {MemoryRouter} from "react-router";

import Home from "./Home/Home";
import InputCamera from "./InputCamera/InputCamera";
import InputCheckBox from "./InputCheckBox/InputCheckBox";
import InputDate from "./InputDate/InputDate";
import InputFile from "./InputFile/InputFile";
import InputNumber from "./InputNumber/InputNumber";
import InputSelect from "./InputSelect/InputSelect";
import InputText from "./InputText/InputText";
import NavBar from "./NavBar/NavBar";
import SignInForm from "./SignInForm/SignInForm";
import SortHeaderCell from "./SortHeaderCell/SortHeaderCell";
import UserForm from "./UserForm/UserForm";
import UserSearchItem from "./UserSearchItem/UserSearchItem";

vi.mock("../services/pubsub.service", () => ({
    publishEvent: vi.fn()
}));

describe("Testing pure components", () => {
    const optionList = [
        {value: 0, text: "Default"},
        {value: 1, text: "First"},
        {value: 2, text: "Second"}
    ];

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("Home renders a default or provided greeting", () => {
        const {rerender} = render(<Home/>);

        expect(screen.getByText("Look for show project")).toBeTruthy();

        rerender(<Home greeting="Welcome"/>);

        expect(screen.getByText("Welcome")).toBeTruthy();
    });

    it("InputText renders value, error, and invokes change and blur callbacks", () => {
        const
            onChange = vi.fn(),
            onBlur = vi.fn();

        render(
            <InputText
                name="email"
                type="email"
                label="Email"
                value="user@example.com"
                placeholder="email"
                error="Invalid email"
                onChange={onChange}
                onBlur={onBlur}/>
        );

        const input = screen.getByDisplayValue("user@example.com");

        expect(screen.getByText("Email")).toBeTruthy();
        expect(screen.getByText("Invalid email")).toBeTruthy();

        fireEvent.change(input, {target: {value: "new@example.com"}});
        fireEvent.blur(input);

        expect(onChange).toHaveBeenCalled();
        expect(onBlur).toHaveBeenCalled();
    });

    it("InputNumber renders numeric attributes and invokes callbacks", () => {
        const
            onChange = vi.fn(),
            onBlur = vi.fn();

        render(
            <InputNumber
                name="seatAmount"
                label="Seats"
                value={10}
                min={0}
                max={20}
                error="Invalid seats"
                onChange={onChange}
                onBlur={onBlur}/>
        );

        const input = screen.getByDisplayValue("10") as HTMLInputElement;

        expect(input.type).toEqual("number");
        expect(input.min).toEqual("0");
        expect(input.max).toEqual("20");
        expect(screen.getByText("Invalid seats")).toBeTruthy();

        fireEvent.change(input, {target: {value: "11"}});
        fireEvent.blur(input);

        expect(onChange).toHaveBeenCalled();
        expect(onBlur).toHaveBeenCalled();
    });

    it("InputCheckBox renders checked state, error, and invokes change", () => {
        const onChange = vi.fn();

        render(
            <InputCheckBox
                name="hasSound"
                label="Has sound"
                checked={true}
                error="Required"
                onChange={onChange}/>
        );

        const checkbox = screen.getByRole("checkbox") as HTMLInputElement;

        expect(checkbox.checked).toEqual(true);
        expect(screen.getByText("Required")).toBeTruthy();

        fireEvent.click(checkbox);

        expect(onChange).toHaveBeenCalled();
    });

    it("InputSelect renders default-filtered options and invokes change", () => {
        const onChange = vi.fn();

        render(
            <InputSelect
                name="kind"
                label="Kind"
                value={1}
                defaultOption={optionList[0]}
                options={optionList}
                error="Invalid kind"
                onChange={onChange}/>
        );

        const select = screen.getByRole("combobox") as HTMLSelectElement;
        const options = within(select).getAllByRole("option") as HTMLOptionElement[];

        expect(options.map(option => option.textContent)).toEqual(["Default", "First", "Second"]);
        expect(select.value).toEqual("1");
        expect(screen.getByText("Invalid kind")).toBeTruthy();

        fireEvent.change(select, {target: {value: "2"}});

        expect(onChange).toHaveBeenCalled();
    });

    it("InputDate renders date value and invokes change", () => {
        const onChange = vi.fn();

        render(
            <InputDate
                name="openDate"
                label="Open date"
                value="2026-06-16"
                error="Invalid date"
                onChange={onChange}/>
        );

        const input = screen.getByDisplayValue("2026-06-16") as HTMLInputElement;

        expect(input.type).toEqual("date");
        expect(screen.getByText("Invalid date")).toBeTruthy();

        fireEvent.change(input, {target: {value: "2026-06-17"}});

        expect(onChange).toHaveBeenCalled();
    });

    it("InputFile renders optional label and invokes change", () => {
        const onChange = vi.fn();

        render(<InputFile name="avatar" label="Avatar" onChange={onChange}/>);

        const input = document.querySelector("input[type='file']") as HTMLInputElement;

        expect(screen.getByText("Avatar")).toBeTruthy();

        fireEvent.change(input);

        expect(onChange).toHaveBeenCalled();
    });

    it("InputCamera renders nested sound and location controls", () => {
        const onChange = vi.fn();

        render(
            <InputCamera
                name="org.camera"
                label="Camera"
                value={{hasSound: true, location: CAMERA_LOCATION.INSIDE}}
                fields={{orgCameraHasSound: "org.camera.hasSound", orgCameraLocation: "org.camera.location"}}
                cameraLocationList={optionList}
                defaultCameraLocationOption={optionList[0]}
                error="Invalid camera"
                onChange={onChange}
                onBlur={vi.fn()}/>
        );

        expect(screen.getByText("Camera")).toBeTruthy();
        expect(screen.getByRole("checkbox")).toHaveProperty("checked", true);
        expect(screen.getByRole("combobox")).toHaveProperty("value", "0");

        fireEvent.click(screen.getByRole("checkbox"));
        fireEvent.change(screen.getByRole("combobox"), {target: {value: "0"}});

        expect(onChange).toHaveBeenCalledTimes(2);
    });

    it("SortHeaderCell renders sort indicators and invokes click", () => {
        const onClick = vi.fn();
        const {rerender} = render(<SortHeaderCell text="Name" sortDir={0 as any} classes="sorted" onClick={onClick}/>);

        expect(screen.getByText(/Name/).textContent).toContain("↓");
        fireEvent.click(screen.getByText(/Name/));
        expect(onClick).toHaveBeenCalled();

        rerender(<SortHeaderCell text="Name" sortDir={1 as any}/>);

        expect(screen.getByText(/Name/).textContent).toContain("↑");
    });

    it("NavBar renders logged-out links", () => {
        render(
            <MemoryRouter initialEntries={["/signin"]}>
                <NavBar logoText="Logo" isLogged={false}/>
            </MemoryRouter>
        );

        expect(screen.getByText("Logo")).toBeTruthy();
        expect(screen.getByText("Home")).toBeTruthy();
        expect(screen.getByText("Sign in")).toBeTruthy();
        expect(screen.getByText("Sign up")).toBeTruthy();
        expect(screen.queryByText("Video")).toEqual(null);
        expect(screen.queryByText("Logout")).toEqual(null);
    });

    it("SignInForm renders fields, errors, save state, and login callback", () => {
        const
            onLogin = vi.fn(event => event.preventDefault()),
            onChange = vi.fn(),
            onBlur = vi.fn(),
            fields = {localEmail: "local.email", localPassword: "local.password"},
            errors = {"local.email": "invalid", "local.password": "Password required"};

        render(
            <SignInForm
                user={{local: {email: "user@example.com", password: "secret"}}}
                fields={fields}
                errors={errors}
                isValid={true}
                isSaving={true}
                onChange={onChange}
                onBlur={onBlur}
                onLogin={onLogin}/>
        );

        expect(screen.getByDisplayValue("user@example.com")).toBeTruthy();
        expect(screen.getByDisplayValue("secret")).toBeTruthy();
        expect(screen.getByText("Invalid email")).toBeTruthy();
        expect(screen.getByText("Password required")).toBeTruthy();

        const button = screen.getByRole("button", {name: "Signing in..."}) as HTMLButtonElement;

        expect(button.disabled).toEqual(true);
    });

    it("SignInForm enables login when valid and not saving", () => {
        const
            onLogin = vi.fn(event => event.preventDefault()),
            fields = {localEmail: "local.email", localPassword: "local.password"};

        render(
            <SignInForm
                user={{local: {email: "user@example.com", password: "secret"}}}
                fields={fields}
                errors={{}}
                isValid={true}
                isSaving={false}
                onChange={vi.fn()}
                onBlur={vi.fn()}
                onLogin={onLogin}/>
        );

        fireEvent.click(screen.getByRole("button", {name: "Sign In"}));

        expect(onLogin).toHaveBeenCalled();
    });

    it("UserForm renders user and organization controls with conditional province/city fields", () => {
        const
            onSave = vi.fn(event => event.preventDefault()),
            onChange = vi.fn(),
            onBlur = vi.fn(),
            fields = {
                localEmail: "local.email",
                localPassword: "local.password",
                localFirstName: "local.firstName",
                localLastName: "local.lastName",
                orgName: "org.name",
                orgKind: "org.kind",
                orgCountryISO: "org.countryISO",
                orgProvinceISO: "org.provinceISO",
                orgCityId: "org.cityId",
                orgAddress: "org.address",
                orgZip: "org.zip",
                orgPhone: "org.phone",
                orgIsNeedSendPaperInvoice: "org.isNeedSendPaperInvoice",
                orgSeatAmount: "org.seatAmount",
                orgOperatingTimeOpen: "org.operatingTimeOpen",
                orgOperatingTimeClose: "org.operatingTimeClose",
                orgAgeRestriction: "org.ageRestriction",
                orgCamera: "org.camera",
                orgCameraHasSound: "org.camera.hasSound",
                orgCameraLocation: "org.camera.location"
            },
            selectOptions = [{value: 0, text: "Default"}, {value: 1, text: "Other"}],
            geoOptions = [{value: "CA", text: "Canada"}, {value: "US", text: "United States"}],
            provinceOptions = [{value: "ON", text: "Ontario"}],
            cityOptions = [{value: "tor", text: "Toronto"}],
            user = {
                local: {
                    email: "user@example.com",
                    password: "secret",
                    firstName: "Ada",
                    lastName: "Lovelace"
                },
                org: {
                    name: "Test Org",
                    kind: 1,
                    countryISO: "CA",
                    provinceISO: "ON",
                    cityId: "tor",
                    address: "123 Test Street",
                    zip: "12345",
                    phone: "123-456-7890",
                    isNeedSendPaperInvoice: true,
                    seatAmount: 12,
                    operatingTimeOpen: 8,
                    operatingTimeClose: 17,
                    ageRestriction: 1,
                    camera: {
                        hasSound: true,
                        location: 1
                    }
                }
            } as any;

        render(
            <UserForm
                user={user}
                fields={fields}
                errors={{"local.email": "invalid", "orgPhone": "invalid"}}
                isValid={true}
                isSaving={false}
                orgKindList={selectOptions}
                defaultKindOption={selectOptions[0]}
                countryList={geoOptions}
                defaultCountryOption={geoOptions[0]}
                provinceList={provinceOptions}
                defaultProvinceOption={provinceOptions[0]}
                cityList={cityOptions}
                defaultCityOption={cityOptions[0]}
                cameraLocationList={selectOptions}
                defaultCameraLocationOption={selectOptions[0]}
                orgAgeRestrictionList={selectOptions}
                defaultAgeRestrictionOption={selectOptions[0]}
                onChange={onChange}
                onBlur={onBlur}
                onSave={onSave}/>
        );

        expect(screen.getByDisplayValue("user@example.com")).toBeTruthy();
        expect(screen.getByDisplayValue("Ada")).toBeTruthy();
        expect(screen.getByDisplayValue("Test Org")).toBeTruthy();
        expect(screen.getByText("Province/State")).toBeTruthy();
        expect(screen.getByText("City")).toBeTruthy();
        expect(screen.getByText("Public camera")).toBeTruthy();
        expect(screen.getByText("Invalid email")).toBeTruthy();

        fireEvent.change(screen.getByDisplayValue("Ada"), {target: {value: "Grace"}});
        fireEvent.blur(screen.getByDisplayValue("Lovelace"));
        fireEvent.click(screen.getByRole("button", {name: "Save"}));

        expect(onChange).toHaveBeenCalled();
        expect(onBlur).toHaveBeenCalled();
        expect(onSave).toHaveBeenCalled();
    });

    it("UserForm hides province and city controls when option lists are empty and disables saving", () => {
        const fields = {
            localEmail: "local.email",
            localPassword: "local.password",
            localFirstName: "local.firstName",
            localLastName: "local.lastName",
            orgName: "org.name",
            orgKind: "org.kind",
            orgCountryISO: "org.countryISO",
            orgProvinceISO: "org.provinceISO",
            orgCityId: "org.cityId",
            orgAddress: "org.address",
            orgZip: "org.zip",
            orgPhone: "org.phone",
            orgIsNeedSendPaperInvoice: "org.isNeedSendPaperInvoice",
            orgSeatAmount: "org.seatAmount",
            orgOperatingTimeOpen: "org.operatingTimeOpen",
            orgOperatingTimeClose: "org.operatingTimeClose",
            orgAgeRestriction: "org.ageRestriction",
            orgCamera: "org.camera",
            orgCameraHasSound: "org.camera.hasSound",
            orgCameraLocation: "org.camera.location"
        };

        render(
            <UserForm
                user={{
                    local: {},
                    org: {
                        camera: {}
                    }
                } as any}
                fields={fields}
                errors={{}}
                isValid={false}
                isSaving={true}
                orgKindList={optionList}
                defaultKindOption={optionList[0]}
                countryList={optionList}
                defaultCountryOption={optionList[0]}
                provinceList={[]}
                cityList={[]}
                cameraLocationList={optionList}
                defaultCameraLocationOption={optionList[0]}
                orgAgeRestrictionList={optionList}
                defaultAgeRestrictionOption={optionList[0]}
                onChange={vi.fn()}
                onBlur={vi.fn()}
                onSave={vi.fn()}/>
        );

        expect(screen.queryByText("Province/State")).toEqual(null);
        expect(screen.queryByText("City")).toEqual(null);
        expect((screen.getByRole("button", {name: "Saving..."}) as HTMLButtonElement).disabled).toEqual(true);
    });

    it("UserSearchItem renders status, organization, location, and invokes click", () => {
        const onClick = vi.fn();
        COUNTRIES["CA"] = "Canada";
        CITIES["tor"] = "Toronto";

        render(
            <UserSearchItem
                user={{
                    isOnline: true,
                    org: {
                        name: "Test Org",
                        city: "tor",
                        country: "CA"
                    }
                } as any}
                onClick={onClick}/>
        );

        expect(screen.getByText("online")).toBeTruthy();
        expect(screen.getByText("Test Org")).toBeTruthy();
        expect(screen.getByText("Toronto(Canada)")).toBeTruthy();

        fireEvent.click(screen.getByText("Test Org"));

        expect(onClick).toHaveBeenCalled();
    });
});
