import {USER_LOGIN_SUCCESS, USER_LOGOUT_SUCCESS} from "./actionTypes";
import {loginToken as loginTokenUser, logout as logoutUser} from "../../services/user.service";

const actionCreatorMapObject = {
    loginToken,
    logout
};

export {
    actionCreatorMapObject
}

function loginSuccess(user) {
    return {type: USER_LOGIN_SUCCESS, user};
}

function logoutSuccess() {
    return {type: USER_LOGOUT_SUCCESS};
}

function loginToken() {
    return (dispatch) => loginTokenUser().then(user => user ? dispatch(loginSuccess(user)) : null);
}

function logout() {
    return (dispatch, getState) => logoutUser().then(() => dispatch(logoutSuccess()), () => dispatch(logoutSuccess()));
}
