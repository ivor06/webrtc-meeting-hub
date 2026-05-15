import {Collection, ObjectID} from "mongodb";
import * as bcryptjs from "bcryptjs";
import {validate, ValidationError} from "jsonschema";

import {UserInterface, Visit} from "../../common/interfaces/User";
import {userSchema} from "../../common/schemas/user";
import {userEditSchema} from "../../common/schemas/userEdit";
import {collections, connectDb, replaceId} from "./db";
import {AUTH} from "../config/config";
import {removeObjectKeys, isEmptyObject} from "../../common/util";
import {HttpError} from "../../common/classes/HttpError";

export {
    findById,
    findByEmail,
    findByToken,
    findAll,
    cleanUser,
    unsetToken,
    insertUser,
    update,
    updateVisitList,
    findOrCreate,
    generateHash,
    generatePassword,
    passwordToHashSync,
    validateUser,
    validatePassword,
    validatePasswordSync,
    getSocketIdOfOnlineUser,
    setOnline
}

const userIdsOnline = {};

const
    USER_FIELDS_DEFAULT = {
        "org.kind": 1,
        "org.name": 1,
        "org.country": 1,
        "org.city": 1,
        "org.seatAmount": 1,
        "org.operatingTimeOpen": 1,
        "org.operatingTimeClose": 1,
        "org.ageRestriction": 1,
        "org.camera": 1,
        "org.photo": 1,
        "org.tags": 1,
        "org.about": 1
    },

    USER_FIELDS_TOKEN = Object.assign({
        "local.token": 1,
        "local.password": 1,
        "local.firstName": 1,
        "local.lastName": 1,
        "local.avatar": 1
    }, USER_FIELDS_DEFAULT),

    USER_FIELDS_LOGIN = Object.assign({
        "local.token": 1
    }, USER_FIELDS_TOKEN),

    USER_FIELDS_ALL = Object.assign({
        "visitList.connectTime": 1,
        "visitList.disconnectTime": 1,
        "visitList": {$slice: -1}
    }, USER_FIELDS_DEFAULT);

let users: Collection;
connectDb().then(() => users = collections["users"]);

function findById(id: string): Promise<UserInterface> {
    return users
        .find({_id: new ObjectID(id)})
        .map(replaceId)
        .limit(1)
        .next()
        .then(user => isEmptyObject(user) ? null : user);
}

function findByEmail(email: string): Promise<UserInterface> {
    return users
        .find({"local.email": email})
        .project(USER_FIELDS_LOGIN)
        .map(replaceId)
        .limit(1)
        .next();
}

function findByToken(token: string): Promise<UserInterface> {
    return users
        .find({"local.token": token})
        .project(USER_FIELDS_TOKEN)
        .map(replaceId)
        .limit(1)
        .next();
}

function findAll(): Promise<UserInterface[]> {
    return users
        .find({})
        .project(USER_FIELDS_DEFAULT)
        .map(user => {
            if (isOnline(user["_id"]))
                user.isOnline = true;
            return replaceId(user);
        })
        .toArray();
}

function insertUser(user: UserInterface): Promise<string> { // TODO Validate
    return users
        .insertOne(user)
        .then(result => (result.result.ok === 1) ? result.insertedId.toString() : null);
}

function unsetToken(token: string): Promise<number> {
    return users
        .updateOne(
            {"local.token": token},
            {$unset: {"local.token": ""}}
        )
        .then(result => result.result.ok && result.result.nModified);
}

function update(user: UserInterface): Promise<boolean> {
    return users
        .updateOne(
            {_id: new ObjectID(user.id)},
            {$set: user},
            {upsert: true}
        )
        .then(result => result.result.ok && result.result.nModified === 1);
}

function updateVisitList(userId: string, visit: Visit): Promise<boolean> {
    return users
        .updateOne(
            {_id: new ObjectID(userId)},
            {$push: {visitList: visit}}
        )
        .then(result => result.result.ok && result.result.nModified === 1);
}

function findOrCreate(user: UserInterface): Promise<string> {
    return findByEmail(user.local.email)
        .then(userFromDb => {
            if (userFromDb)
                throw new HttpError(403, "Forbidden", "User registered already");
            return insertUser(user);
        });
}

const
    charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
    charsetLength = charset.length;

function generatePassword(length = 6): string {
    let password = "";
    for (let i = 0; i < length; i++) {
        password = password + charset.charAt(Math.floor(Math.random() * charsetLength));
    }
    return password;
}

function generateHash(password: string): Promise<string> {
    return bcryptjs.genSalt(1).then(salt => bcryptjs.hash(password, salt));
}

function passwordToHashSync(password: string): string {
    return bcryptjs.hashSync(password, bcryptjs.genSaltSync());
}

function validateUser(user: UserInterface, isEdit?: boolean): ValidationError[] {
    return validate(user, isEdit ? userEditSchema : userSchema).errors;
}

function validatePassword(password: string, password2: string): Promise<boolean> {
    return bcryptjs.compare(password, password2);
}

function validatePasswordSync(password: string, password2: string): boolean {
    return bcryptjs.compareSync(password, password2);
}

function cleanUser(dbUser: UserInterface): UserInterface {
    const user: UserInterface = {
        id: dbUser.id,
        roles: dbUser.roles
    };
    user.local = removeObjectKeys(
        dbUser.local,
        AUTH.LOCAL.REMOVE_FIELD_LIST);
    return user;
}

function setOnline(userId: string, isOnline: boolean, socketId?: string) {
    if (isOnline && !userIdsOnline[userId])
        userIdsOnline[userId] = socketId || true;
    if (!isOnline)
        delete userIdsOnline[userId];
}

function getSocketIdOfOnlineUser(userId: string) {
    return userIdsOnline[userId];
}

function isOnline(userId: string) {
    return !!userIdsOnline[userId];
}
