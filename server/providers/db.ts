import {MongoClient, Db, Collection} from "mongodb";

import {DB} from "../config/config";
import {log} from "../config/log";
import {HashObject, HashNumber} from "../../common/interfaces/baseTypes";

const
    collections: HashObject<Collection<any>> = {},
    counts: HashNumber = {};

export {
    connectDb,
    disconnectDb,
    getDbStats,
    replaceId,
    collections,
    counts
}

let client: MongoClient = null,
    database: Promise<Db> = null;

function connectDb(): Promise<Db> {
    if (database)
        return database;
    return database = MongoClient.connect(DB.URL).then(dbClient => {
        client = dbClient;
        const db = dbClient.db(DB.DB_NAME);
        return Promise.all(["users"]
        .filter(collectionName => db.collection(collectionName))
        .map(collectionName => db.collection(collectionName).countDocuments({}).then(count => {
            collections[collectionName] = db.collection(collectionName);
            return counts[collectionName] = count;
        }))).then(() => db);
    });
}

function disconnectDb(): Promise<void> {
    return connectDb().then(() => client.close());
}

function getDbStats() {
    return connectDb()
        .then(db => ['users', 'questions'].map(collectionName => db.collection(collectionName)
            ? db.collection(collectionName).countDocuments({}).then(count => log.info("collection", collectionName, "has", count, "items"))
            : null));
}

function replaceId<T>(result: T): T {
    if (result) {
        result["id"] = result["_id"];
        delete result["_id"];
    }
    return result;
}
