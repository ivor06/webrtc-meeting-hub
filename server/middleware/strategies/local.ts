import * as jwt from "jsonwebtoken";

import {AUTH, SERVER} from "../../config/config";
import {log} from "../../config/log";
import {UserInterface} from "../../../common/interfaces/User";
import {Email} from "../../../common/classes/Email";
import {HttpError} from "../../../common/classes/HttpError";
import {rejectedPromise} from "../../../common/util";
import {
    findByEmail,
    update,
    findOrCreate,
    passwordToHashSync,
    validateUser,
    generatePassword,
    validatePasswordSync,
    findByToken
} from "../../providers/user";

import {sendEmail} from "../../providers/email";
import {async} from "q";

const
    localRegisterInit = async (user) => {

        const errorList = validateUser(user);

        console.log("localRegisterInit. user:", user, "\nerrorList:", errorList);

        if (!user || (errorList && errorList.length))
            throw new HttpError(400, "Bad request", "Invalid user");

        const token = jwt.sign({
            email: user.local.email,
            password: user.local.password
        }, AUTH.LOCAL.JWT_SECRET, {
            algorithm: "HS256"
        });

        Object.assign(user.local, {
            password: passwordToHashSync(user.local.password),
            token
        });

        const id = await findOrCreate(user);

        if (!id)
            throw new HttpError(500, "Server error", "User register failed. Please try again.");

        return await {
            id,
            token
        };
    },

    localLoginInit = async (email, password) => {

        const user = await findByEmail(email);

        if (!user)
            throw new HttpError(404, "Not found", "User not found");

        if (!validatePasswordSync(password, user.local.password))
            throw new HttpError(401, "Unauthorized", "Invalid password");

        return await user;
    },

    checkTokenInit = async (token: string): Promise<UserInterface> => {

        if (!jwt.decode(token))
            throw new HttpError(400, "Bad request", "Invalid token");

        const user = await findByToken(token);

        if (!user || !validatePasswordSync(jwt.decode(token)["password"], user.local.password))
            throw new HttpError(401, "Unauthorized", "Invalid token");

        return await user;
    },

    localRecoveryPassword = (req): Promise<boolean | HttpError> => {
        const
            email = req.body.email,
            isValid = Email.validate(email),
            newPassword = generatePassword();
        if (!isValid)
            return rejectedPromise(new HttpError(400, "Bad Request", "Valid email required"));
        log("new password for email", email + ":", newPassword);
        return findByEmail(email)
            .then(user => {
                if (!user)
                    return rejectedPromise(new HttpError(404, "Not Found", "User not found"));
                // user.local.password = passwordToHashSync(newPassword);
                return sendEmail({
                    to: email,
                    subject: "password recovery from " + SERVER.DOMAIN_NAME,
                    text: "Your new password for " + SERVER.DOMAIN_NAME + " is: " + newPassword,
                    html: "<p>Your new password for " + SERVER.DOMAIN_NAME + " is: <strong>" + newPassword + "</strong></p>"
                })
                    .then(sentMessageInfo => {
                        log("sentMessageInfo:", sentMessageInfo);
                        return update(user);
                    });
            });
    };

export {
    localRegisterInit,
    checkTokenInit,
    localLoginInit,
    localRecoveryPassword
}
