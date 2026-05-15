import {SOCKET_IO_URL} from "../config/config";
import {joinUrl} from "../../../common/url";
import {MessageInterface} from "../../../common/interfaces/message";
import {getToken} from "./localStorage.service";
import {publishEvent} from "./pubsub.service";

export {
    join,
    getIpAddr,
    setUserId,
    sendMessage,
    sendSignal,
    sendCall,
    sendHangUp,
    sendReject,
    sendAccept
}

interface Socket {
    id: string;
    io: any;
    connected: boolean;
    disconnected: boolean;
    on(event: string, callback: (data: any, data2?: any) => void);
    emit(event: string, data?: any, data2?: any, cb?: (time?: any) => void, cb2?: (time?: any) => void);
    disconnect(close?: boolean);
    remove();
}

declare const io: {
    socket: Socket;
    connect(url: string, opts?: { transports?: string[], secure?: boolean, rejectUnauthorized?: boolean }): Socket;
    on(target: string, cb: (data: any, data2?: any) => void);
};

let
    userId: string,
    userToken: string,
    socketId: string,
    socket: Socket,
    socketOnConnect: any,
    connection: Promise<string>;

function connectSocketIO() {

    connection = new Promise((resolve, reject) => {
        const
            querySocketId = socketId ? "?socketId=" + socketId : null,
            queryUserToken = userToken ? "?userToken=" + userToken : null,
            queryTimeZone = userToken ? "?timezone=" + new Date().getTimezoneOffset() : null,
            path = joinUrl(SOCKET_IO_URL, querySocketId, queryUserToken, queryTimeZone);

        socketId = null;

        socket = io.connect(path, {transports: ["websocket", "xhr-polling"], secure: true, rejectUnauthorized: false}); // 'opening', 'open', 'closing', 'closed'

        socketOnConnect = socket.on("connect", () => {
            if (!socketId) {
                socketId = socket.id || null;

                socket.on("message", (message: MessageInterface, callback) => {
                    callback && callback();
                    if (!(message.time instanceof Date))
                        message.time = new Date(message.time);
                    publishEvent("message", message);
                });

                socket.on("message-delivered", (messageId: string) => publishEvent("message-delivered", messageId));

                socket.on("error", (error: string) => console.error("socket on error:", error));

                socket.on("userStatus", (user: string, isOnline: boolean) => publishEvent("userStatus", user, isOnline));

                socket.on("signal", (uId: string, signal: any) => publishEvent("signal", uId, signal));

                socket.on("call", (uId: string) => publishEvent("call", uId));

                socket.on("hangup", (uId: string) => publishEvent("hangup", uId));

                socket.on("accept", (uId: string) => publishEvent("accept", uId));

                socket.on("reject", (uId: string) => publishEvent("reject", uId));

                socket.on("join", (uId: string) => publishEvent("join", uId));
            }

            resolve(socketId);
        });
    });
}

function join(room: string): Promise<Date> {
    return new Promise(resolve => socket.emit("join", room, time => resolve(time)));
}

function sendSignal(remoteUserId: string, signal: any): Promise<Date> {
    return new Promise(resolve => socket.emit("signal", remoteUserId, signal, time => resolve(time)));
}

function sendCall(remoteUserId: string): Promise<Date> {
    return new Promise(resolve => socket.emit("call", remoteUserId, time => resolve(time)));
}

function sendHangUp(remoteUserId: string): Promise<Date> {
    return new Promise(resolve => socket.emit("hangup", remoteUserId, time => resolve(time)));
}

function sendReject(remoteUserId: string): Promise<Date> {
    return new Promise(resolve => socket.emit("reject", remoteUserId, time => resolve(time)));
}

function sendAccept(remoteUserId: string): Promise<Date> {
    return new Promise(resolve => socket.emit("accept", remoteUserId, time => resolve(time)));
}

function getIpAddr(): Promise<Date> {
    return new Promise(resolve => socket.emit("ipaddr", time => resolve(time)));
}

function sendMessage(message: MessageInterface): Promise<{ time: Date, id: string }> {
    return new Promise(resolve => socket.emit(
        "message",
        message,
        resolve
    ));
}

function setUserId(uId: string) {
    if (uId === null)
        disconnectSocketIO();
    else if (uId !== userId) {
        userToken = getToken();
        userId = uId;
        if (connection instanceof Promise)
            connection.then(() => {
                socket.on("disconnect", () => {
                    socket = null;
                    socketOnConnect = null;
                    return connectSocketIO();
                });
                socket.disconnect(true);
            });
        connectSocketIO();
    }
}

function disconnectSocketIO() {
    socket.disconnect(true);
    userId = null;
    userToken = null;
    socketId = null;
    socket = null;
    socketOnConnect = null;
    connection = null;
}
