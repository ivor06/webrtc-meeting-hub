import Koa = require("koa");
import serve = require("koa-static");
import bodyParser = require("koa-bodyparser");
import compress = require("koa-compress");
import * as http from "http";
import {AddressInfo} from "net";
import {Z_SYNC_FLUSH} from "zlib";

import {SERVER} from "./config/config";
import {routes, allowedMethods} from "./routes/index";
import error from "./middleware/error";
import log from "./middleware/log";
import redirect from "./middleware/redirect";

export {
    Server
};

class Server {
    app: Koa;
    server: http.Server;

    static bootstrap(): Server {
        return new Server();
    }

    constructor() {
        this.app = new Koa();

        this.app.use(error);
        this.app.use(log);
        this.app.use(bodyParser());
        this.app.use(compress({
            filter: content_type => /(text|javascript)/i.test(content_type),
            threshold: 2048,
            flush: Z_SYNC_FLUSH
        }));
        this.app.use(serve(SERVER.PATH_STATIC));
        this.app.use(routes());
        this.app.use(allowedMethods());
        this.app.use(redirect);

        this.server = this.app.listen(SERVER.PORT, SERVER.HOST_NAME, () => {
            const address = this.server.address() as AddressInfo;
            console.log("app listen on", address.address + ":" + address.port);
        });
    }

    close() {
        this.server.close(data => console.log("Server closed:", data));
    }
}
