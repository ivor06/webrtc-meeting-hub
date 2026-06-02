import {cleanup} from "@testing-library/react";
import {afterEach, vi} from "vitest";

afterEach(() => {
    cleanup();
});

if (!URL.createObjectURL)
    URL.createObjectURL = vi.fn(() => "blob:test-object-url");

if (!URL.revokeObjectURL)
    URL.revokeObjectURL = vi.fn();

if (!window.matchMedia) {
    window.matchMedia = vi.fn().mockImplementation(query => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn()
    }));
}
