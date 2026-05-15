import {USER_REGISTER_SUCCESS, USER_LOGIN_SUCCESS, USER_LOGOUT_SUCCESS} from "./actionTypes";
import initialState, {blankUser} from "../../store/initial";
import {isContainsValue} from "../../../../common/util";

export {
    userReducer,
    userIsLoggedReducer
}

function userReducer(state = initialState.user, action) {

    if (isContainsValue([USER_REGISTER_SUCCESS, USER_LOGIN_SUCCESS], action.type)) {
        if (action.user.local.token)
            delete action.user.local.token;
        return action.user;
    }

    if (action.type === USER_LOGOUT_SUCCESS)
        return Object.assign({}, blankUser);

    return state;
}

function userIsLoggedReducer(state = initialState.isLogged, action) {
    if (isContainsValue([USER_LOGIN_SUCCESS, USER_LOGOUT_SUCCESS], action.type))
        return !!(action.user && action.user.id);

    return state;
}
