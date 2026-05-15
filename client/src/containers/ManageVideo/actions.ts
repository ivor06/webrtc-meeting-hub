import {USER_LOAD_SUCCESS, USER_LOGIN_SUCCESS, USER_UPDATE_SUCCESS} from "./actionTypes";
import {fetchStart, fetchError} from "../../actions/index";
import {getUser, save as registerUser, login as loginUser} from "../../services/user.service";
import {ProfileLocal, UserInterface} from "../../../../common/interfaces/User";

const actionCreatorMapObject = {
    loadUser,
    save,
    login
};

export {
    actionCreatorMapObject
}

function userLoadSuccess(user) {
    return {type: USER_LOAD_SUCCESS, user};
}

function loginSuccess(user) {
    return {type: USER_LOGIN_SUCCESS, user};
}

export function updateUserSuccess() {
    return {type: USER_UPDATE_SUCCESS};
}

function save(user: UserInterface) {
    return dispatch => {
        dispatch(fetchStart());

        return registerUser(user)
            .then(registerData => {
                if (registerData)
                    dispatch(loginSuccess(Object.assign({id: registerData.id}, user)));
                else
                    dispatch(updateUserSuccess());
            })
            .catch(error => {
                dispatch(fetchError());
                throw error;
            });
    };
}

function login(profile: ProfileLocal) {
    return dispatch => {
        return loginUser(profile)
            .then(user => {
                if (user)
                    dispatch(loginSuccess(user));
            })
            .catch(error => {
                dispatch(fetchError());
                throw error;
            });
    };
}

function loadUser(id: string) {
    return dispatch => {
        dispatch(fetchStart());
        return getUser(id)
            .then(courses => {
                dispatch(userLoadSuccess(courses));
            })
            .catch(error => {
                throw error;
            });
    };
}
