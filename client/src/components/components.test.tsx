import * as React from "react";
import {fireEvent, render, screen, within} from "@testing-library/react";
import {beforeEach, describe, expect, it, vi} from "vitest";
import {CAMERA_LOCATION} from "../../../common/interfaces/User";

import Home from "./Home/Home";
import InputCamera from "./InputCamera/InputCamera";
import InputCheckBox from "./InputCheckBox/InputCheckBox";
import InputDate from "./InputDate/InputDate";
import InputFile from "./InputFile/InputFile";
import InputNumber from "./InputNumber/InputNumber";
import InputSelect from "./InputSelect/InputSelect";
import InputText from "./InputText/InputText";

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
});
