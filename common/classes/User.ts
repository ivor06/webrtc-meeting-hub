import {UserInterface, ProfileLocal, Organization} from "../interfaces/User";
import {} from "../interfaces/User";

export {
    User
}

class User implements UserInterface {

    public local: ProfileLocal;
    public org: Organization;

    static getName(user: UserInterface): string {
        return user.local.firstName + " " + user.local.lastName;
    }

    static getPhotoUrl(basePath: string, user: UserInterface): string {
        return basePath + (user.org.screenShot
                ? user.org.screenShot
                : "default-photo.jpg");
    }

    constructor(user?: UserInterface) {
        if (user)
            for (const key in user)
                if (user.hasOwnProperty(key))
                    this[key] = user[key];
    }

    getName(): string {
        return this.local.firstName + " " + this.local.lastName;
    }

    getPhotoUrl(basePath: string): string {
        return basePath + (this.org.screenShot
                ? this.org.screenShot
                : "default-photo.jpg");
    }
}
