import {USER_LOGIN_SUCCESS, USER_LOGOUT_SUCCESS} from "./actionTypes";

export {
    countryListdReducer,
    userListReducer
}

function countryListdReducer(state = [], action) {
    return state;
}

function userListReducer(state = [], action) {
    if (action.type === USER_LOGIN_SUCCESS || action.type === USER_LOGOUT_SUCCESS)
        return state;
    return state;
}
