import {ObjectID} from "mongodb";
import {HttpError} from "../../common/classes/HttpError";
import {findAll, findById} from "../providers/user";
import {isEmptyObject} from "../../common/util";

export {
    all,
    id
}

async function all(ctx) {

    ctx.body = await findAll();
}

async function id(ctx) {
    if (!ctx.params || !ctx.params.id)
        throw new HttpError(400, "Bad request", "User Id required");

    try {
        const idObj = new ObjectID(ctx.params.id);
    } catch (e) {
        throw new HttpError(400, "Bad request", "Invalid id");
    }

    const user = await findById(ctx.params.id);

    if (!user || isEmptyObject(user))
        throw new HttpError(404, "Not found", "User not found");

    ctx.body = user;
}
