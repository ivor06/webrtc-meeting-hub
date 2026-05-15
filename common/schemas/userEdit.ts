import {userSchema} from "./user";

const
    userEditSchema = Object.assign({id: "/UserEdit"}, Object.assign({}, userSchema)),
    localType = userEditSchema.definitions.LocalType,
    requiredList = localType.required;

requiredList.splice(requiredList.findIndex(item => item === "password"), 1);
delete localType.properties.password;
export {
    userEditSchema
};
