import * as React from "react";
import {fireEvent, render, screen} from "@testing-library/react";
import {beforeEach, describe, expect, it, vi} from "vitest";

import Home from "./Home/Home";
import InputCheckBox from "./InputCheckBox/InputCheckBox";
import InputNumber from "./InputNumber/InputNumber";
import InputText from "./InputText/InputText";

vi.mock("../services/pubsub.service", () => ({
    publishEvent: vi.fn()
}));

describe("Testing pure components", () => {

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
});
