import {HashString} from "./baseTypes";

export {
    Country
}

interface Country {
    id?: string;
    ISO?: string;
    continentIsoCode?: string;
    continentName?: HashString;
    name?: HashString;
}
