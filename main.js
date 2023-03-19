import env from "dotenv";
import { metaTxListener } from "./RelayerService.js";
import { addRelayerAccounts, setExecutionStatus } from "./utils/utils.service.js";
env.config();

setExecutionStatus(false);
addRelayerAccounts();
metaTxListener();