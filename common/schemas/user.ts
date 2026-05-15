import {JsonSchema} from "../interfaces/jsonschema";

export const userSchema: JsonSchema = {
    id: "/User",
    type: "object",
    properties: {
        id: {type: "string"},
        isOnline: {type: "string"},
        roles: {$ref: "#/definitions/RolesType"},
        timezone: {type: "number"},
        visitList: {
            type: "array",
            items: {$ref: "#/definitions/VisitType"}
        },
        local: {$ref: "#/definitions/LocalType"},
        org: {$ref: "#/definitions/OrgType"}
    },
    additionalProperties: false,
    definitions: {
        GeoType: {
            type: "object",
            required: ["latitude", "longitude"],
            properties: {
                latitude: {type: "number"},
                longitude: {type: "number"},
                geo_id: {type: "number"},
                country_iso_code: {type: "string"},
                country: {type: "string"},
                city: {type: "string"},
                time_zone: {type: "string"}
            },
            additionalProperties: false
        },
        RolesType: {
            type: "object",
            properties: {
                isAdmin: {type: "boolean"},
                isModerator: {type: "boolean"}
            },
            additionalProperties: false
        },
        VisitType: {
            type: "object",
            properties: {
                language: {type: "string"},
                ip: {type: ["string", "null"]},
                userAgent: {type: "string"},
                timezone: {type: "number"},
                geo: {$ref: "#/definitions/GeoType"},
                connectTime: {type: "Date"},
                disconnectTime: {type: "Date"},
                currentRoom: {type: "string"}
            },
            additionalProperties: false
        },
        LocalType: {
            type: "object",
            required: ["email", "password", "firstName", "lastName"],
            properties: {
                email: {
                    type: "string",
                    pattern: /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
                },
                password: {type: "string", minLength: 1},
                firstName: {type: "string", minLength: 2},
                lastName: {type: "string", minLength: 2},
                taxNumber: {type: ["string", "null"]},
                token: {type: "string"},
                avatar: {type: "string"},
                language: {type: "string"}
            },
            additionalProperties: false
        },
        OrgType: {
            type: "object",
            required: [
                "kind", "name", "countryISO", "cityId", "address", "zip", "phone",
                "isNeedSendPaperInvoice", "operatingTimeOpen", "operatingTimeClose"
            ],
            properties: {
                id: {type: "string"},
                kind: {
                    type: "number",
                    minimum: 0,
                    maximum: 4
                },
                name: {type: "string", minLength: 2},
                countryISO: {type: "string", minLength: 2, maxLength: 2},
                provinceISO: {type: "string", minLength: 2, maxLength: 3},
                cityId: {type: "string"},
                address: {type: "string", minLength: 5},
                zip: {type: "string", minLength: 5, maxLength: 6},
                phone: {
                    type: "string",
                    pattern: /\(?([0-9]{3})\)?([ .-]?)([0-9]{3})\2([0-9]{4})/
                },
                isNeedSendPaperInvoice: {type: "boolean"},
                seatAmount: {type: ["number", "null"]},
                operatingTimeOpen: {type: ["number", "null"]},
                operatingTimeClose: {type: ["number", "null"]},
                camera: {
                    type: "object",
                    properties: {
                        hasSound: {type: "boolean"},
                        location: {type: "number"},
                        lastScreenShot: {type: "string"},
                        resolution: {type: "array", items: {type: "number"}}
                    },
                    additionalProperties: false
                },
                ageRestriction: {type: "number"},
                tags: {
                    type: "object",
                    patternProperties: {"\w+": {type: "boolean"}},
                    additionalProperties: false
                },
                photo: {type: "string"},
                about: {type: "string"}
            },
            additionalProperties: false
        },
        CameraType: {
            type: "object",
            properties: {
                isInside: {type: "boolean"},
                hasSound: {type: "boolean"},
                lastScreenShot: {type: "string"},
                kind: {type: "string"},
                resolution: {type: "array", items: {type: "number"}}
            },
            additionalProperties: false
        }
    }
};
