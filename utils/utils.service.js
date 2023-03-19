import fs from "fs";
import env from "dotenv";

env.config();

export const getExecutionStatus = () => {
    try {
        var data = fs.readFileSync("busy.json", "utf8");
        return JSON.parse(data).status;
    } catch (e) {
        console.log("Error:", e.stack);
    }
};

export const setExecutionStatus = (status) => {
    try {
        let data = JSON.stringify({ status });
        fs.writeFileSync("busy.json", data);
    } catch (e) {
        console.log("Error:", e.stack);
    }
};


export const getRelayerAccounts = () => {
    try {
        let data = fs.readFileSync("accounts.json", "utf8");
        return JSON.parse(data);
    } catch (e) {
        console.log("Error:", e.stack);
        return null;
    }
};

export const setRelayerAccounts = (accounts) => {
    try {

        fs.writeFileSync("accounts.json", JSON.stringify(accounts));

    } catch (e) {
        console.log("Error:", e.stack);
        return null;
    }
};

export const addRelayerAccounts = () => {
    const accountKeys = process.env.RELAYER_KEYS.split(",");

    const relayerAccounts = [];

    for (let relayerAccount of accountKeys) {
        let relayerAccountObj = { privateKey: relayerAccount, isLocked: false };
        relayerAccounts.push(relayerAccountObj);
    }

    fs.writeFileSync("accounts.json", JSON.stringify(relayerAccounts));
};