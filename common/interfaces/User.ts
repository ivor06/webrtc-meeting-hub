import {HashBoolean} from "./baseTypes";
export {
    UserInterface,
    Organization,
    Camera,
    Visit,
    ProfileLocal,
    Login,
    ORG_KIND
}

interface UserInterface {
    id?: string;
    isOnline?: boolean;
    timezone?: number;
    roles?: HashBoolean;
    local?: ProfileLocal;
    org?: Organization;
    getName?: () => string;
}

interface ProfileLocal {
    email?: string;
    password?: string;
    firstName?: string;
    lastName?: string;
    taxNumber?: string;
    token?: string;
    avatar?: string;
    language?: string;
}

interface Login {
    email?: string;
    password?: string;
}

interface Organization {
    id: string;
    kind: ORG_KIND;
    name: string;
    country: string;
    city: string;
    address: string;
    zip: string;
    phone?: string;
    isNeedSendPaperInvoice: boolean;
    seatAmount?: number;
    operatingTimeOpen?: number;
    operatingTimeClose?: number;
    camera?: Camera;
    ageRestriction: AGE_RESTRICTION;
    photo?: string;
    tags?: HashBoolean;
    about?: string;
}

interface Camera {
    hasSound?: boolean;
    location?: CAMERA_LOCATION;
    lastScreenShot?: string;
    resolution?: number[];
}

interface Visit {
    timezone?: number;
    ip?: string;
    userAgent?: string;
    geo?: Geo;
    connectTime?: Date;
}

interface Geo {
    latitude?: number;
    longitude?: number;
    geo_id?: number;
    country_iso_code?: string;
    country?: string;
    city?: string;
    time_zone?: string;
}

const enum ORG_KIND {
    BAR, CAFE, CLUB, RESTAURANT, OTHER
}

const enum CAMERA_LOCATION {
    INSIDE, STREET
}

const enum AGE_RESTRICTION {
    "12+",
    "14+",
    "16+",
    "18+",
    "21+"
}
