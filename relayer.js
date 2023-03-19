const Web3 = require('web3');
require("dotenv").config();
const BATCHED_ERC20_TRANSFER_ABI = require('./ABI/BatchedERC20Transfer.json');

// Initialize a Web3 instance with the relevant network provider
const web3 = new Web3(new Web3.providers.HttpProvider('https://rpc-mumbai.maticvigil.com'));

const relayer = web3.eth.accounts.privateKeyToAccount(process.env.RELAYER);

const signer = web3.eth.accounts.privateKeyToAccount(process.env.PRIVATE_KEY);

const contractId = "0x26911B0F3eCdF8dF3c7f7AF2a0a3Ae8a340e2F27";

const exexuteTx = async() => {

    const chainId = await web3.eth.getChainId();

    let domainData = {
        name: "BatchedERC20Transfer",
        version: "1",
        chainId: chainId, // Matic Testnet
        verifyingContract: contractId,
    };

    const domainType = [
        { name: "name", type: "string" },
        { name: "version", type: "string" },
        { name: "chainId", type: "uint256" },
        { name: "verifyingContract", type: "address" },
    ];

    const MetaTransactionData = [
        { name: "from", type: "address" },
        { name: "nonce", type: "uint256" },
        { name: "relayer", type: "address" },
        { name: "functionSignature", type: "bytes" },
    ]

    const Contract = new web3.eth.Contract(BATCHED_ERC20_TRANSFER_ABI, contractId);

    const nonce = 0;

    let message = {};

    message.from = signer.address; //0xc76B92448a9cCbfC7021DF63601376Ba5Cb079f0
    message.nonce = nonce;
    message.relayer = relayer.address; //0x73c0D20aB453aD893db78998c7f4c47ED9D86837
    message.functionSignature = "0x00";


    const dataToSign = JSON.stringify({
        types: {
            EIP712Domain: domainType,
            MetaTransaction: MetaTransactionData,
        },
        domain: domainData,
        primaryType: "MetaTransaction",
        message: message
    })

    const signature = signer.sign(dataToSign, signer.address);

    console.log(signature)

    // const recover = web3.eth.accounts.recoverTypedSignature({
    //     data: JSON.parse(dataToSign),
    //     sig: signature.signature
    // });

    // console.log(recover);
    const messageHash = web3.utils.sha3(dataToSign);
    console.log(messageHash);
    console.log(signer.address)

    const recoveredAddress = await web3.eth.accounts.recover(messageHash, signature.signature);

    console.log(recoveredAddress);
}

exexuteTx();