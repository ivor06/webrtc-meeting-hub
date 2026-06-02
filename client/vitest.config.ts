import {defineConfig} from "vitest/config";

export default defineConfig({
    test: {
        environment: "jsdom",
        environmentOptions: {
            jsdom: {
                url: "http://localhost"
            }
        },
        setupFiles: ["src/test/setup.ts"],
        include: ["src/**/*.test.ts", "src/**/*.test.tsx"],
        coverage: {
            provider: "v8",
            include: ["src/**/*.{ts,tsx}"],
            exclude: [
                "src/main.tsx",
                "src/routes.tsx",
                "src/config/**",
                "src/**/types.ts",
                "src/**/actionTypes.ts",
                "src/**/index.ts"
            ]
        }
    }
});
