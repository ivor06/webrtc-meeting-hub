import {combineReducers} from 'redux';

import {countryListdReducer, userListReducer} from "../containers/App/reducers";
import {userReducer, userIsLoggedReducer} from "../containers/ManageUser/reducers";
import {getUserNameByIdReducer, getUserScreenshotByIdReducer} from "../containers/ManageVideo/reducers";

export const rootReducer = combineReducers({
    user: userReducer,
    userList: userListReducer,
    countryList: countryListdReducer,
    isLogged: userIsLoggedReducer,
    getOrgNameById: getUserNameByIdReducer,
    getUserScreenshotById: getUserScreenshotByIdReducer
});
