import {EmailInterface} from "../interfaces/email";

export {
    Email
}

const RE_EMAIL = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

class Email implements EmailInterface {

    static validate(email: string): boolean {
        return RE_EMAIL.test(email);
    }

    constructor(email?: EmailInterface) {
        if (email)
            for (const key in email)
                this[key] = email[key];
    }
}
