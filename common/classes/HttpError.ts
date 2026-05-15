import {BaseError} from "./BaseError";

export {
    HttpError
}

class HttpError extends BaseError {
    status: number;
    message: string;
    title?: string;

    constructor(statusCode: number, title?: string, message?: string) {
        super(message, title);
        this.status = statusCode;
    }

    toString(): string {
        return this.status + " " + super.toString();
    }
}
