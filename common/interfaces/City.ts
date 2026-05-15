import {HashString} from "./baseTypes";

export {
    City
}

interface City {
    id?: string;
    countryISO?: string;
    subdivisionISO?: string;
    subdivisionName?: HashString;
    subdivision2ISO?: string;
    subdivision2Name?: HashString;
    name?: HashString;
    timeZone?: string;
}
