import {JsonSchema} from "../interfaces/jsonschema";

export const loginSchema: JsonSchema = {
    id: "/User",
    type: "object",
    required: ["email", "password"],
    properties: {
        email: {
            type: "string",
            pattern: /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
        },
        password: {type: "string", minLength: 1}
    },
    additionalProperties: false
};
