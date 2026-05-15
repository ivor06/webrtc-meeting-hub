import {networkInterfaces} from "os";
import * as https from "https";
import * as SocketIO from "socket.io";

import {IS_PRODUCTION} from "../config/config";
import {log} from "../config/log";
import {findByToken, getSocketIdOfOnlineUser, setOnline, updateVisitList} from "../providers/user";
import {UserInterface} from "../../common/interfaces/User";
import {MessageInterface} from "../../common/interfaces/Message";

export {
    MessageService
}

const RE_IP = /.+:(\d+\.\d+\.\d+\.\d+)/;

const transportList = [
    "websocket",
    "xhr-polling",
    "jsonp-polling"
];

class MessageService {

    private server: SocketIO.Server;

    private clients = {};

    private messages = {};

    constructor() {
    }

    public getUsersByRoom(room?: string): any { // TODO Type
        return this.clients;
    }

    public getOnlineUsers(): any { // TODO Type
        return this.clients;
    }

    onConnect(socket) {
        const
            socketId = socket.id,
            userSocketId = socket.handshake && socket.handshake.query && socket.handshake.query.socketId || null,
            userToken = socket.handshake && socket.handshake.query && socket.handshake.query.userToken || null;

        log.log("user connected. socketId:", socketId, "  userSocketId:", userSocketId, "  userToken:", userToken);

        if (userSocketId && this.clients[userSocketId])
            this.onDisconnect(userSocketId, "reconnect");

        const resolveUser: Promise<UserInterface> = new Promise((resolve, reject) => {
            if (userToken)
                findByToken(userToken).then(
                    user => {
                        log.log("user found by token:", user && user.id);
                        resolve(user);
                    },
                    reject);
            else
                resolve(null);
        });

        resolveUser.then(
            user => {
                if (user) {
                    this.setClient(socket, user);

                    /* User's message */
                    socket.on("message", this.onMessage.bind(this, socketId));

                    socket.on("signal", this.onSignal.bind(this, socketId));

                    socket.on("call", this.onCall.bind(this, socketId));

                    socket.on("hangup", this.onHangUp.bind(this, socketId));

                    socket.on("reject", this.onRejectCall.bind(this, socketId));

                    socket.on("accept", this.onAcceptCall.bind(this, socketId));

                    socket.on("ipaddr", this.onIpAddr.bind(this, socketId));

                    /* User's disconnect */
                    socket.on("disconnect", this.onDisconnect.bind(this, socketId));
                } else
                    socket.emit("errorMessage", "User not found");
            },
            error => {
                log.error(error);
                socket.emit("errorMessage", "Error happened");
            }
        );
    }

    onDisconnect(socketId, reason) {
        log.log("user disconnected", socketId, "  reason:", reason);
        if (this.clients[socketId]) {
            if (this.clients[socketId].userId && this.clients[socketId].visit)
                updateVisitList(this.clients[socketId].userId, Object.assign(this.clients[socketId].visit, {disconnectTime: new Date()})); // TODO Promise returned by updateVisitList is ignored
            setOnline(this.clients[socketId].userId, false);

            this.server.sockets.emit("userStatus", this.clients[socketId].userId, false);

            delete this.clients[socketId];
        }
    }

    onMessage(socketId: string, message: MessageInterface, callbackRecievedByServer?: (time?: any) => void) {

        const
            time = new Date(),
            userId = this.clients[socketId].userId,
            socketIdTo = getSocketIdOfOnlineUser(message.userIdTo); // TODO Validate message

        if (!this.messages[userId])
            this.messages[userId] = [];

        const msg = Object.assign(message, {
            time: new Date(),
            id: this.messages[userId].length
        });

        this.messages[userId].push(msg);

        callbackRecievedByServer && callbackRecievedByServer({
            time,
            id: msg.id
        });

        if (this.clients[socketIdTo] && this.clients[socketId])
            try {
                this.clients[socketIdTo].socket.emit("message", msg, () => this.clients[socketId].socket.emit("message-delivered", msg.id));
            } catch (e) {
                log.error(e);
            }
    }

    onSignal(socketId: string, userIdTo: string, signal, callback) {
        const
            time = new Date(),
            socketIdTo = getSocketIdOfOnlineUser(userIdTo);
        if (this.clients[socketIdTo] && this.clients[socketId])
            try {
                this.clients[socketIdTo].socket.emit("signal", this.clients[socketId].userId, signal);
            } catch (e) {
                log.error(e);
            }
        callback && callback(time);
    }

    onCall(socketId: string, userIdTo: string, callback) {
        const
            time = new Date(),
            socketIdTo = getSocketIdOfOnlineUser(userIdTo);
        if (this.clients[socketIdTo] && this.clients[socketId])
            try {
                this.clients[socketIdTo].socket.emit("call", this.clients[socketId].userId);
            } catch (e) {
                log.error(e);
            }
        callback && callback(time);
    }

    onHangUp(socketId: string, userIdTo: string, callback) {
        const
            time = new Date(),
            socketIdTo = getSocketIdOfOnlineUser(userIdTo);
        if (this.clients[socketIdTo] && this.clients[socketId])
            try {
                this.clients[socketIdTo].socket.emit("hangup", this.clients[socketId].userId);
            } catch (e) {
                log.error(e);
            }
        callback && callback(time);
    }

    onAcceptCall(socketId: string, userIdTo: string, callback) {
        const
            time = new Date(),
            socketIdTo = getSocketIdOfOnlineUser(userIdTo);
        if (this.clients[socketIdTo] && this.clients[socketId])
            try {
                this.clients[socketIdTo].socket.emit("accept", this.clients[socketId].userId);
            } catch (e) {
                log.error(e);
            }
        callback && callback(time);
    }

    onRejectCall(socketId: string, userIdTo: string, callback) {
        const
            time = new Date(),
            socketIdTo = getSocketIdOfOnlineUser(userIdTo);
        if (this.clients[socketIdTo] && this.clients[socketId])
            try {
                this.clients[socketIdTo].socket.emit("reject", this.clients[socketId].userId);
            } catch (e) {
                log.error(e);
            }
        callback && callback(time);
    }

    onIpAddr(socketId, callback) {
        const ifaces = networkInterfaces();
        for (const dev in ifaces) {
            ifaces[dev].some(details => {
                if (details.family === 'IPv4' && (!IS_PRODUCTION || IS_PRODUCTION && details.address !== '127.0.0.1')) {
                    callback(details.address);
                    return true;
                }
                return false;
            });
        }
    }

    setClient(socket: SocketIO.Socket & { client: any, conn: any, request: any }, user: UserInterface) {

        const
            socketId = socket.id,
            matchIp = (
                socket.client.request.headers["x-forwarded-for"]
                || socket.client.conn.remoteAddress
                || socket.conn.remoteAddress
                || socket.request.connection.remoteAddress
                || ""
            ).match(RE_IP),
            ip = (matchIp && matchIp.length) ? matchIp[1] : null;

        this.clients[socketId] = {
            userId: user.id,
            socket,
            visit: {
                ip,
                userAgent: socket.handshake.headers["user-agent"],
                connectTime: new Date(),
                timezone: socket.handshake.query.timezone
            }
        };

        setOnline(user.id, true, socketId);

        this.server.sockets.emit("userStatus", user.id, true);
    }

    start(serverHttps: https.Server) {
        this.server = SocketIO.listen(serverHttps, {
            transports: transportList
        });

        this.server.sockets.on("connection", this.onConnect.bind(this));
    }
}
