import * as React from "react";

import {UserSearchItemProps} from "./types";
import {COUNTRIES, CITIES} from "../../../../common/dictionaries/geo.dictionary";

const OrgSearchItem = ({user, onClick}: UserSearchItemProps) => <div className="org-search-item" onClick={onClick}>
    <span className={user.isOnline ? "online" : "offline"}>{user.isOnline ? "online" : "offline"}</span>
    <span>{user.org.name}</span>
    <span>{CITIES[user.org.city]}({COUNTRIES[user.org.country]})</span>
</div>;

export default OrgSearchItem;
