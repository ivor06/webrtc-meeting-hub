import initialState from "../../store/initial";

export {
    getUserNameByIdReducer,
    getUserScreenshotByIdReducer
}

function getUserNameByIdReducer(state = initialState.getOrgNameById) {
    return state;
}

function getUserScreenshotByIdReducer(state = initialState.getUserScreenshotById) {
    return state;
}
