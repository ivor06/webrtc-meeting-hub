import {HashString} from "./baseTypes";

export {
    Province
}

interface Province {
    id?: string;
    ISO?: string;
    countryISO?: string;
    name?: HashString;
}
