import * as izitoast from "izitoast";

export {
    notificationError,
    notificationSuccess
}

izitoast.settings({
    timeout: 10000,
    position: "topRight",
    resetOnHover: true,
    transitionIn: "fadeInUp",
    balloon: true
});

function notificationError(message: string) {
    izitoast.show({
        message,
        backgroundColor: "#bd362f",
        icon: "glyphicon glyphicon-exclamation-sign"
    });
}

function notificationSuccess(message: string) {
    izitoast.show({
        message,
        backgroundColor: "#51a351",
        icon: "glyphicon glyphicon-ok"
    });
}
