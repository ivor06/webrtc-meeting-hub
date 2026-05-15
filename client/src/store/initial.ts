import {UserInterface} from "../../../common/interfaces/User";
import {ORG_KIND_DEFAULT_ID, CAMERA_LOCATION_DEFAULT_ID} from "../../../common/dictionaries/org.dictionary";

const
    blankUser = {
        timezone: (new Date().getTimezoneOffset() / 60) * (-1),
        local: {},
        org: {
            kind: ORG_KIND_DEFAULT_ID,
            isNeedSendPaperInvoice: false,
            operatingTimeOpen: 8,
            operatingTimeClose: 23,
            camera: {
                hasSound: false,
                location: CAMERA_LOCATION_DEFAULT_ID
            }
        }
    },
    userList = [];

export {
    blankUser
}

export default {
    user: Object.assign({}, blankUser),
    remoteUserId: null,
    userList,
    countryList: null,
    cityList: null,
    getOrgNameById: (id: string, usrList: UserInterface[]): string => {
        let name: string = null;
        usrList
            .some(user => {
                if (id === user.id) {
                    name = !!user && !!user.org && !!user.org.name ? user.org.name : "Partner";
                    return true;
                }
                return false;
            });
        return name;
    },
    getUserScreenshotById: (id: string, usrList: UserInterface[]): string => {
        let screenshot: string = null;
        usrList
            .some(user => {
                if (id === user.id) {
                    screenshot = !!user && !!user.org && !!user.org.screenShot ? user.org.screenShot : "no-preview";
                    return true;
                }
                return false;
            });
        return screenshot;
    },
    fetchesInProgress: 0,
    isLogged: false
};
