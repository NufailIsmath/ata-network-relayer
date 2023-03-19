import { client, MetaTxesCollection } from "./utils/mongo.service.js";
import cron from "node-cron"
import { getExecutionStatus, setExecutionStatus } from "./utils/utils.service.js";
import { executeMetatx } from "./executeMetaTx/execute.js"

// update on Stream
let metaTxReqArr = [];

// refer MINT ERC721 in depro-listener
export const metaTxListener = async() => {
    console.log("[INFO] => Listening for new Meta Tx Request ...");
    await client.connect();
    console.log("[INFO] => DB connection successfull");

    const MetaTxesChangeStream = MetaTxesCollection.watch();

    cron.schedule('*/15 * * * * *', async() => {
        if (!getExecutionStatus()) {
            if (metaTxReqArr.length > 0) {
                console.log("[LOG] => In Cron: Executing a Meta Tx");
                setExecutionStatus(true);
                const metaTxDoc = metaTxReqArr.shift();
                await executeMetatx(metaTxDoc);
            }
        }
    });


    MetaTxesChangeStream.on("change", async(change) => {
        if (change.operationType == "insert") {
            if (!change.fullDocument.isExecuted) {
                console.log("[INFO] => New Meta Tx added to queue");
                metaTxReqArr.push(change.fullDocument);
            }

        }
    })
}