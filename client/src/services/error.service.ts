import {HttpError} from "../../../common/classes/HttpError";

export {
    getErrorMessage
}

const
    errorMap = {
        "user-register": {
            400: "All of form fields should be correct",
            403: "This email registered already"
        },
        "user-login": {
            400: "Email and password required",
            401: "Invalid password",
            404: "User with specified email not found"
        },
        "user-token": {
            400: "Token required",
            401: "User is not authorized"
        },
        "user-password-recover": {
            400: "Email required",
            404: "User with specified email not found"
        }
    },
    defaultError = "Error happened. Please try again or reload the page";

function getErrorMessage(error: any, scope: string): string {
    let errorMessage: string;
    if (error instanceof HttpError) {
        try {
            errorMessage = errorMap[scope][error.status];
        } catch (e) {
            errorMessage = defaultError;
        }
    } else
        errorMessage = error.message ? error.message : error;

    return errorMessage;
}
