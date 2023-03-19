import env from "dotenv";
import { MongoClient } from "mongodb";
env.config();

const connUrl = `mongodb+srv://nufail:${process.env.MONGO_PSWD}@cluster0.ztntp3d.mongodb.net/metaTx?retryWrites=true&w=majority`;

const client = new MongoClient(connUrl);
const db = client.db("metaTx");
const MetaTxesCollection = db.collection("metatxes");

export {
    client,
    db,
    MetaTxesCollection
}