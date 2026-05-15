import {validate, ValidationError} from "jsonschema";

import {userSchema} from "../../../common/schemas/user";
import {loginSchema} from "../../../common/schemas/login";
import {Login, UserInterface} from "../../../common/interfaces/User";
import {JsonSchema} from "../../../common/interfaces/jsonschema";
import {isString} from "../../../common/util";

const schemaRegistry = new Map<string, JsonSchema>();

export {
    registerSchema,
    validateFormInput,
    validateUser,
    validateLogin,
    registerPartialSchemaList
}

function validateFormInput(name, value): ValidationError[] {
    return validate(value, schemaRegistry.get(name)).errors;
}

function validateLogin(login: Login): ValidationError[] {
    return validate(login, loginSchema).errors;
}

function validateUser(user: UserInterface): ValidationError[] {
    return validate(user, userSchema).errors;
}

function createPartialSchema(name: string): JsonSchema {
    const
        definitionType = name.charAt(0).toUpperCase() + name.substring(1, name.indexOf(".")) + "Type",
        field = name.substring(name.indexOf(".") + 1);

    let
        partialSchema = userSchema.definitions[definitionType].properties[field],
        subName = field,
        subSchema = userSchema.definitions[definitionType];

    while (subName.indexOf(".") !== -1) {
        subSchema = subSchema.properties[subName.substring(0, subName.indexOf("."))];
        subName = subName.substring(subName.indexOf(".") + 1);
        if (subName.indexOf(".") === -1)
            partialSchema = subSchema.properties[subName];
    }

    return partialSchema ? partialSchema : null;
}

function registerPartialSchemaList(nameList: string | string[]) {
    isString(nameList)
        ? createPartialSchema(nameList as string)
        : (nameList as string[]).forEach(name => registerSchema(name, createPartialSchema(name)));
}

function registerSchema(name: string, schema: JsonSchema) {
    schemaRegistry.set(name, schema);
}
