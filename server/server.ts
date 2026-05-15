import * as Koa from "koa";
import * as serve from "koa-static";
import * as bodyParser from "koa-bodyparser";
import * as compress from "koa-compress";
import * as https from "https";
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
    server: https.Server;

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

        this.server = this.app.listen(SERVER.PORT, SERVER.HOST_NAME, () =>
            console.log("app listen on", this.server.address().address + ":" + this.server.address().port));
    }

    close() {
        this.server.close(data => console.log("Server closed:", data));
    }
}
