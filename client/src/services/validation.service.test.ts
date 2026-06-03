import {beforeEach, describe, expect, it, vi} from "vitest";

import {JsonSchema} from "../../../common/interfaces/JsonSchema";
import {Login, UserInterface} from "../../../common/interfaces/User";

describe("Testing validation.service.ts", () => {
    let service: typeof import("./validation.service");

    const validLogin: Login = {
        email: "user@example.com",
        password: "secret"
    };

    const validUser: UserInterface = {
        timezone: 0,
        local: {
            email: "user@example.com",
            password: "secret",
            firstName: "Ada",
            lastName: "Lovelace"
        },
        org: {
            id: "org-1",
            kind: 1,
            name: "Test Org",
            countryISO: "CA",
            cityId: "tor",
            address: "123 Test Street",
            zip: "12345",
            phone: "123-456-7890",
            isNeedSendPaperInvoice: false,
            operatingTimeOpen: 8,
            operatingTimeClose: 17,
            camera: {
                hasSound: false,
                location: 1
            },
            ageRestriction: 0
        } as any
    };

    beforeEach(async () => {
        vi.resetModules();
        service = await import("./validation.service");
    });

    it("validates login objects against required email and password rules", () => {
        expect(service.validateLogin(validLogin)).toHaveLength(0);

        const errors = service.validateLogin({email: "not-email", password: ""});

        expect(errors.map(error => error.property)).toEqual(["instance.email", "instance.password"]);
    });

    it("validates users against nested user schema rules", () => {
        expect(service.validateUser(validUser)).toHaveLength(0);

        const invalidUser = {
            ...validUser,
            local: {
                ...validUser.local,
                firstName: "A"
            }
        };

        const errors = service.validateUser(invalidUser);

        expect(errors[0].property).toEqual("instance.local.firstName");
    });

    it("registers explicit schemas and validates form input with them", () => {
        const schema: JsonSchema = {type: "string", minLength: 3};

        service.registerSchema("test.name", schema);

        expect(service.validateFormInput("test.name", "Ada")).toHaveLength(0);
        expect(service.validateFormInput("test.name", "Al")[0].property).toEqual("instance");
    });

    it("registers partial schemas for arrays and single field names", () => {
        service.registerPartialSchemaList(["local.email", "org.camera.location"]);
        service.registerPartialSchemaList("local.firstName");

        expect(service.validateFormInput("local.email", "user@example.com")).toHaveLength(0);
        expect(service.validateFormInput("local.email", "invalid")[0].property).toEqual("instance");
        expect(service.validateFormInput("org.camera.location", 1)).toHaveLength(0);
        expect(service.validateFormInput("org.camera.location", "street")[0].property).toEqual("instance");
        expect(service.validateFormInput("local.firstName", "Ada")).toHaveLength(0);
        expect(service.validateFormInput("local.firstName", "A")[0].property).toEqual("instance");
    });
});
