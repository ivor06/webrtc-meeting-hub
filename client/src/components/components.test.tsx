import * as React from "react";
import {render, screen} from "@testing-library/react";
import {beforeEach, describe, expect, it, vi} from "vitest";

import Home from "./Home/Home";

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
});
