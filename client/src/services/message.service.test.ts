import {afterEach, beforeEach, describe, expect, it, vi} from "vitest";

describe("Testing message.service.ts", () => {
    const originalIo = globalThis["io"];
    let connectCalls;
    let publishEvent;
    let getToken;
    let token: string;
    let sockets;
    let service: typeof import("./message.service");

    class MockSocket {
        id: string;
        handlers: Record<string, (...args: any[]) => void> = {};
        emits: any[] = [];
        disconnect = vi.fn();

        constructor(id: string) {
            this.id = id;
        }

        on(event: string, callback: (...args: any[]) => void) {
            this.handlers[event] = callback;
            return callback;
        }

        emit(event: string, data?: any, data2?: any, cb?: (data?: any) => void) {
            this.emits.push({event, data, data2, cb});
            const callback = typeof data === "function" ? data : (typeof data2 === "function" ? data2 : cb);
            if (callback)
                callback({event, delivered: true});
        }
    }

    beforeEach(async () => {
        connectCalls = [];
        sockets = [];
        token = "token-1";
        publishEvent = vi.fn();
        getToken = vi.fn(() => token);

        vi.spyOn(Date.prototype, "getTimezoneOffset").mockReturnValue(-60);

        globalThis["io"] = {
            connect: vi.fn((url, opts) => {
                const socket = new MockSocket("socket-" + (sockets.length + 1));
                sockets.push(socket);
                connectCalls.push({url, opts, socket});
                return socket;
            })
        };

        vi.resetModules();
        vi.doMock("./localStorage.service", () => ({getToken}));
        vi.doMock("./pubsub.service", () => ({publishEvent}));

        service = await import("./message.service");
    });

    afterEach(() => {
        globalThis["io"] = originalIo;
        vi.restoreAllMocks();
        vi.resetModules();
    });

    const connectUser = (userId = "user-1") => {
        service.setUserId(userId);
        const socket = sockets[sockets.length - 1];
        socket.handlers.connect();
        return socket;
    };

    it("connects with token and timezone query parameters", () => {
        const socket = connectUser();

        expect(getToken).toHaveBeenCalled();
        expect(connectCalls[0]).toEqual({
            url: "https://localhost:443?userToken=token-1&timezone=-60",
            opts: {transports: ["websocket", "xhr-polling"], secure: true, rejectUnauthorized: false},
            socket
        });
    });

    it("does not reconnect when the user id is unchanged", () => {
        connectUser("user-1");

        service.setUserId("user-1");

        expect(connectCalls).toHaveLength(1);
    });

    it("disconnects the previous socket before reconnecting another user", async () => {
        const firstSocket = connectUser("user-1");

        service.setUserId("user-2");
        await new Promise(resolve => setTimeout(resolve, 0));

        expect(firstSocket.disconnect).toHaveBeenCalledWith(true);
        expect(connectCalls).toHaveLength(2);
        expect(connectCalls[1].url).toEqual("https://localhost:443?socketId=socket-1&userToken=token-1&timezone=-60");
    });

    it("disconnects and clears the current socket when user id is null", () => {
        const socket = connectUser();

        service.setUserId(null);

        expect(socket.disconnect).toHaveBeenCalledWith(true);
    });

    it("publishes inbound socket events", () => {
        const socket = connectUser();
        const ack = vi.fn();
        const message = {
            id: "message-1",
            time: "2026-06-15T10:00:00.000Z",
            text: "Hello"
        };

        socket.handlers.message(message, ack);
        socket.handlers["message-delivered"]("message-1");
        socket.handlers.userStatus("user-2", true);
        socket.handlers.signal("user-2", {data: "signal"});
        socket.handlers.call("user-2");
        socket.handlers.hangup("user-2");
        socket.handlers.accept("user-2");
        socket.handlers.reject("user-2");
        socket.handlers.join("user-2");

        expect(ack).toHaveBeenCalled();
        expect(message.time).toBeInstanceOf(Date);
        expect(publishEvent).toHaveBeenCalledWith("message", message);
        expect(publishEvent).toHaveBeenCalledWith("message-delivered", "message-1");
        expect(publishEvent).toHaveBeenCalledWith("userStatus", "user-2", true);
        expect(publishEvent).toHaveBeenCalledWith("signal", "user-2", {data: "signal"});
        expect(publishEvent).toHaveBeenCalledWith("call", "user-2");
        expect(publishEvent).toHaveBeenCalledWith("hangup", "user-2");
        expect(publishEvent).toHaveBeenCalledWith("accept", "user-2");
        expect(publishEvent).toHaveBeenCalledWith("reject", "user-2");
        expect(publishEvent).toHaveBeenCalledWith("join", "user-2");
    });

    it("emits outbound socket events and resolves callback payloads", async () => {
        const socket = connectUser();
        const message = {id: "message-1", text: "Hello"} as any;
        const signal = {command: "SDP"};

        await expect(service.join("room-1")).resolves.toEqual({event: "join", delivered: true});
        await expect(service.sendSignal("user-2", signal)).resolves.toEqual({event: "signal", delivered: true});
        await expect(service.sendCall("user-2")).resolves.toEqual({event: "call", delivered: true});
        await expect(service.sendHangUp("user-2")).resolves.toEqual({event: "hangup", delivered: true});
        await expect(service.sendReject("user-2")).resolves.toEqual({event: "reject", delivered: true});
        await expect(service.sendAccept("user-2")).resolves.toEqual({event: "accept", delivered: true});
        await expect(service.getIpAddr()).resolves.toEqual({event: "ipaddr", delivered: true});
        await expect(service.sendMessage(message)).resolves.toEqual({event: "message", delivered: true});

        expect(socket.emits.map(item => item.event)).toEqual([
            "join",
            "signal",
            "call",
            "hangup",
            "reject",
            "accept",
            "ipaddr",
            "message"
        ]);
        expect(socket.emits[1]).toMatchObject({event: "signal", data: "user-2", data2: signal});
        expect(socket.emits[7]).toMatchObject({event: "message", data: message});
    });
});
