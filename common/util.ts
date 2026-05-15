import {HashObject} from "./interfaces/baseTypes";

const TYPES = {
    STRING: "string",
    BOOLEAN: "boolean",
    NUMBER: "number",
    ARRAY: "array",
    OBJECT: "object",
    FUNCTION: "function"
};

export {
    TYPES,
    mapObject,
    traversalObject,
    removeObjectKeys,
    filterObjectKeys,
    someObjectKeys,
    removeUndefined,
    isEmptyObject,
    onError,
    isNumber,
    isString,
    isBoolean,
    isObject,
    isContainsValue,
    arrayToHash,
    promiseSeries,
    resolvedPromise,
    rejectedPromise,
    cloneObject,
    getObject,
    setObject
}

function traversalObject(obj: HashObject<any>, iterator: (obj: any, key: string) => void): boolean {
    let result = false;
    if (obj !== null && typeof obj === TYPES.OBJECT && typeof iterator === TYPES.FUNCTION && Object.keys.length > 0) {
        result = true;
        Object.keys(obj).forEach(key => {
            try {
                iterator(obj[key], key);
            } catch (e) {
                result = false;
            }
        });
    }
    return result;
}

function mapObject(obj: HashObject<any>, iterator: (obj: any, key: string) => HashObject<any>): HashObject<any> {
    const result = {};
    if (obj !== null && typeof obj === TYPES.OBJECT && typeof iterator === TYPES.FUNCTION && Object.keys.length > 0)
        Object.keys(obj).forEach(key => {
            try {
                result[key] = iterator(obj[key], key);
            } catch (e) {
                console.error(e);
                throw e;
            }
        });
    return result;
}

function someObjectKeys(obj: any, iterator: (obj: any, key: string) => boolean) {
    let result = false;
    if (obj !== null && typeof obj === TYPES.OBJECT && typeof iterator === TYPES.FUNCTION && Object.keys.length > 0) {
        result = true;
        return Object.keys(obj).some(key => {
            try {
                return iterator(obj[key], key);
            } catch (e) {
                return false;
            }
        });
    }
    return result;
}

function removeObjectKeys<T>(obj: T, fieldList: string[]): T {
    if ((typeof obj === TYPES.OBJECT) && fieldList.length)
        fieldList.forEach((field: string) => delete obj[field]);
    return obj;
}
/**
 * Filter object' keys specified in array
 * @param {!(Object)} obj Filtered object
 * @param {!String[]} fieldList Array of keys
 * @return {Object}
 *
 * @example filterObjectKeys({a: 1, b: 2}, ["a"]); // {a: 1}
 */
function filterObjectKeys<T>(obj: T, fieldList: string[]): T {
    if ((typeof obj === TYPES.OBJECT) && fieldList.length) {
        const result = {};
        fieldList.forEach(field => {
            if (obj.hasOwnProperty(field) && obj[field] !== null)
                result[field] = obj[field];
        });
        return result as T;
    }
    return obj;
}

function removeUndefined<T>(obj: T): T {
    traversalObject(obj, (value, key) => {
        if (value === undefined)
            delete obj[key];
        else if (value && isObject(value))
            removeUndefined(value);
    });
    return obj;
}

/**
 * Filter object' keys specified in array
 * @param {!(Object[])} arr Filtered object
 * @param {!String} keyField Key of array' item
 * @param {Boolean[]} needRemoveKeyField Need remove key from array' item?
 * @return {Object}
 *
 * @example arrayToHash([{a: "abc", b: 2}, {a: "bcd", b: 4}], "a"); // {abc: {a: "abc", b: 2}, bcd: {a: "bcd", b: 4}}
 * @example arrayToHash([{a: "abc", b: 2}, {a: "bcd", b: 4}], "a", true); // {abc: {b: 2}, bcd: {b: 4}}
 */
function arrayToHash<T>(arr: T[], keyField: string, needRemoveKeyField?: boolean): HashObject<T> {
    if (!arr || !arr.length)
        return {};
    const resultObj = {};
    arr.forEach(item => resultObj[item[keyField]] = needRemoveKeyField ? removeObjectKeys(item, [keyField]) : item);
    return resultObj;
}

function displayObject(obj) {
    for (const key of obj) {
        if (obj.hasOwnProperty(key) && !(obj[key] instanceof Function))
            console.error(key + ": " + obj[key]);
    }
}

function onError(error) {
    console.error((new Date).toLocaleTimeString() + " error: ", error);
    if (error instanceof Object) displayObject(error);
}

function promiseSeries(promiseList: Array<Promise<any>>, callback?): Promise<any[]> {
    const resultList = [];
    return promiseList.reduce((prev, promise) => prev.then(() => promise.then(result => {
        if (typeof callback === TYPES.FUNCTION)
            resultList.push(callback(result));
        return resultList;
    })), Promise.resolve());
}

function isNumber(value: any): boolean {
    // return (value !== null) && !isNaN(value) && (typeof value === TYPES.NUMBER);
    return typeof value === TYPES.NUMBER || value instanceof Number;
}

function isBoolean(value: any): boolean {
    return typeof value === TYPES.BOOLEAN || value instanceof Boolean;
}

function isString(value: any): boolean {
    return typeof value === TYPES.STRING || value instanceof String;
}

function isObject(value: any): boolean {
    return typeof value === TYPES.OBJECT;
}

function isEmptyObject(obj: any): boolean {
    return (obj == null || (isObject(obj) && Object.getOwnPropertyNames(obj).length === 0));
}

/*
 isContainsValue([1, 2, 3], 2) === true
 isContainsValue([1, 3], 2) === false
 isContainsValue({a: 1, b: 2}, 2) === true
 isContainsValue({a: 1, b: 3}, 2) === false
 */
function isContainsValue<T>(obj: HashObject<T> | T[], value: T): boolean {
    let result = false;
    if (obj instanceof Array)
        result = obj.some(item => item === value);
    else if ((obj instanceof Object) && !isEmptyObject(obj))
        return someObjectKeys(obj, (item => item === value));
    return result;
}

function resolvedPromise<T>(value: T): Promise<T> {
    return new Promise((resolve, reject) => resolve(value));
}

function rejectedPromise<T>(value: T): Promise<T> {
    return new Promise((resolve, reject) => reject(value));
}

function cloneObject<T>(obj: T): T {
    return JSON.parse(JSON.stringify(obj));
}

/* Get a property from a dot-separated string, such as "A.B.C". See dojo._base.lang */
function getObject(name, context): any {
    return _getProp(name ? name.split(".") : [], false, context);
}

/* Set a property from a dot-separated string, such as "A.B.C". See dojo._base.lang */
function setObject(name: string, value: any, context: HashObject<any>): boolean {
    if (!name || !isObject(context) || context === null)
        return false;
    const
        parts = name.split("."),
        p = parts.pop(),
        obj = _getProp(parts, true, context);
    if (obj && p) {
        obj[p] = value;
        return true;
    }
    return false;
}

/* See dojo._base.lang */
function _getProp(parts: string[], create: boolean, context: HashObject<any>): any {
    let result = null;
    try {
        for (const index in parts) {
            const p = parts[index];
            if (!(p in context))
                if (create)
                    context[p] = {};
                else
                    return null;
            context = context[p];
        }
        result = context;
    } catch (e) {
        console.error("getting object property failed:", e);
    }
    return result;
}
