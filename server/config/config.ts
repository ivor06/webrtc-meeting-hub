const IS_PRODUCTION = false;

export {
    IS_PRODUCTION,
    SERVER,
    DB,
    AUTH
}

/* Server configure */
namespace SERVER {
    export const HOST_NAME = IS_PRODUCTION ? "******" : "127.0.0.1";
    export const PORT = IS_PRODUCTION ? 80 : 3000;
    export const PATH_STATIC = IS_PRODUCTION
        ? "******"
        : "../client/dist/";
    export const LOG_FILE = IS_PRODUCTION ? "/data/log/info.log" : "logs/info.log";
    export const LOG_ERROR_FILE = IS_PRODUCTION ? "/data/log/error.log" : "logs/error.log";
    export const LOG_EXCEPTIONS_FILE = IS_PRODUCTION ? "/data/log/exceptions.log" : "logs/exceptions.log";
    export const EMAIL = "******@******.***";
}

/* Database configure */
namespace DB {
    export const DB_NAME = "@******";
    export const URL = IS_PRODUCTION ? "mongodb://@******:@******@127.0.0.1:27017/" + DB.DB_NAME : "mongodb://127.0.0.1:27017/" + DB_NAME;
}

/* Auth configure */
namespace AUTH {
    export const LOCAL = {
        JWT_SECRET: "******",
        CREDENTIALS_LIST: ["email", "token"]
    };
}
