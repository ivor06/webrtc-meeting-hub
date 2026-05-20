export {
    fetchStart,
    fetchError
}

function fetchStart() {
    return {type: "FETCH_START"};
}

function fetchError() {
    return {type: "FETCH_ERROR"};
}
