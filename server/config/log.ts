import * as winston from "winston";
import DailyRotateFile = require("winston-daily-rotate-file");

import {SERVER, IS_PRODUCTION} from "./config";

const
    log = winston.createLogger({
        exitOnError: false,
        transports: [
            new winston.transports.Console(),
            new DailyRotateFile({
                datePattern: "yyyy-MM-dd-HH",
                filename: SERVER.LOG_FILE,
                level: IS_PRODUCTION ? "debug" : "info"
            }),
            new DailyRotateFile({
                datePattern: "yyyy-MM-dd-HH",
                filename: SERVER.LOG_ERROR_FILE,
                level: 'error'
            })
        ],
        exceptionHandlers: [
            new winston.transports.Console(),
            new DailyRotateFile({
                datePattern: "yyyy-MM-dd-HH",
                filename: SERVER.LOG_EXCEPTIONS_FILE,
                handleExceptions: true
            })
        ]
    });

export {
    log
}
