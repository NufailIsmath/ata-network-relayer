import { createRequire } from "module";
const require = createRequire(
    import.meta.url);
import Web3 from "web3";
import env from "dotenv";
import { BN } from "web3-utils";
import { getRelayerAccounts, setRelayerAccounts } from "../utils/utils.service.js";
import { client, MetaTxesCollection } from "../utils/mongo.service.js";

env.config();

export const executeMetatx = async(metaTxDoc) => {
    let isExecuted = false;

    let relayerAccounts = getRelayerAccounts();

    let relayerAccountObj = { account: null, index: 0 };
    for (let i = 0; i < relayerAccounts.length; i++) {
        if (!relayerAccounts[i].isLocked) {
            relayerAccountObj.account = relayerAccounts[i];
            relayerAccountObj.index = i;
            relayerAccounts[i].isLocked = true;
            setRelayerAccounts(relayerAccounts);
            break;
        }
    }

    try {
        if (relayerAccountObj.account) {
            await client.connect();
            let transfers = metaTxDoc.transfers;
            let metatx = metaTxDoc.metaTx;
            let signR = metaTxDoc.signR;
            let signS = metaTxDoc.signS;
            let signV = metaTxDoc.signV;

            // Mumbai - Polygon chain
            const web3 = new Web3(new Web3.providers.HttpProvider("https://matic-mumbai.chainstacklabs.com"));

            const relayerAccount = web3.eth.accounts.privateKeyToAccount(relayerAccountObj.account.privateKey);

            console.log(`[INFO] => The Relayer ${relayerAccount.address} is executing the meta tx`);
            metatx.relayer = relayerAccount.address;

            // contract initilaizations
            const ReceiverABI = require("../ABI/Receiver.json");
            const contractId = "0xA68Ee0A5b969CaaeA83DC545c8cD996e282ec2B7";

            const Receiver = new web3.eth.Contract(ReceiverABI, contractId);

            const gasPrice = await web3.eth.getGasPrice();
            const gasEstimate = await web3.eth.estimateGas({
                to: contractId,
                data: Receiver.methods.executeBatchedERC20Transfers(metatx, transfers, signV, signR, signS).encodeABI(),
                from: relayerAccount.address
            });

            if (gasEstimate > MAX_GAS_LIMIT) {
                console.log(`[WARN] => This meta tx request Id ${metaTxDoc._id} gas limit exceeds the maximum gas limit`);
                return;
            }

            // build tx
            console.log("[INFO] => Building transaction");
            const tx = {
                from: relayerAccount.address,
                to: contractId,
                gas: gasEstimate,
                gasPrice: new BN(gasPrice),
                data: Receiver.methods.executeBatchedERC20Transfers(metatx, transfers, signV, signR, signS).encodeABI(),
            }

            // sign tx
            console.log("[INFO] => Signing transaction");
            const signedTx = await relayerAccount.signTransaction(tx);
            const raw = signedTx.rawTransaction;

            // submit tx
            console.log("[INFO] => Submitting transaction");
            const sentTx = await web3.eth.sendSignedTransaction(raw);

            if (sentTx) {
                console.log("[INFO] => Transaction Executed Successfully");
                isExecuted = true;

                MetaTxesCollection.updateOne({ _id: metaTxDoc._id }, {
                    $set: {
                        isExecuted,
                        txHash: sentTx.transactionHash
                    }
                })
            }
            setExecutionStatus(false);

        } else {
            relayerAccounts[relayerAccountObj.index].isLocked = false;
            setRelayerAccounts(relayerAccounts);
            setExecutionStatus(false);
        }
    } catch (error) {
        console.log(`[ERROR] => ${error}`);
        relayerAccounts[relayerAccountObj.index].isLocked = false;
        setRelayerAccounts(relayerAccounts, blockchain);
        setExecutionStatus(false);

    }

    if (!isExecuted) {
        setTimeout(function() {
            executeMetatx(metaTxDoc);
        }, 5000);
    }

}