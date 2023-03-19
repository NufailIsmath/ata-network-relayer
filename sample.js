const Web3 = require('web3');
const { ethers } = require('ethers');
require("dotenv").config();
const BATCHED_ERC20_TRANSFER_ABI = require('./ABI/BatchedERC20Transfer.json');

// Initialize a Web3 instance with the relevant network provider
const web3 = new Web3(new Web3.providers.HttpProvider('https://rpc-mumbai.maticvigil.com'));

// Initialize an ethers.js instance with the Web3 provider
const provider = new ethers.providers.JsonRpcProvider('https://rpc-mumbai.maticvigil.com');

// Create a signer object with a private key
const signer = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

const relayer = new ethers.Wallet(process.env.RELAYER, provider);

// Initialize a contract instance with the deployed contract address and ABI
const batchedERC20TransferContract = new ethers.Contract('0x26911B0F3eCdF8dF3c7f7AF2a0a3Ae8a340e2F27', BATCHED_ERC20_TRANSFER_ABI, signer);

// Generate a valid signature for a MetaTransactionData object
function signMetaTransaction(metaTx) {
    const domainSeparator = batchedERC20TransferContract.getDomainSeparator();
    const digest = ethers.utils.keccak256(
        ethers.utils.solidityPack(
            ['bytes1', 'bytes1', 'bytes32', 'bytes32'], [
                '0x19',
                '0x01',
                domainSeparator,
                batchedERC20TransferContract.hashMetaTransaction(metaTx),
            ],
        ),
    );
    return signer.signMessage(ethers.utils.arrayify(digest));
}

// Construct the necessary data for the executeBatchedERC20Transfers function call
async function constructBatchedTransferData(metaTx, transfers) {
    const nonce = await batchedERC20TransferContract._nonces(metaTx.from);
    const signature = signMetaTransaction(metaTx);
    const { v, r, s } = ethers.utils.splitSignature(signature);
    return {
        metaTx,
        transfers,
        v,
        r,
        s,
        nonce,
    };
}

// Submit a transaction to the executeBatchedERC20Transfers function with the constructed data
async function executeBatchedTransfers(data) {
    const { metaTx, transfers, v, r, s, nonce } = data;
    const tx = await batchedERC20TransferContract.executeBatchedERC20Transfers(
        metaTx,
        transfers,
        v,
        r,
        s, { nonce },
    );
    await tx.wait();
    console.log('Batched transfers executed!');
    console.log(tx)
}

// Usage example
const metaTx = {
    from: signer.address,
    nonce: 0,
    relayer: relayer.address,
    functionSignature: ethers.utils.id("transferFrom(address,address,uint256)"),
};
const transfers = [{
        tokenAddress: '0x328f211E1008722156d27D3BC129962b3Dd02Ad2',
        recipient: '0xb7Cd3878c7DfEf409894e66a33aA75C06881E4a5',
        amount: '1000000000000000000',
    },
    {
        tokenAddress: '0x9abdFB7EA66fE604852A33182077aaF5E491b675',
        recipient: '0xb7Cd3878c7DfEf409894e66a33aA75C06881E4a5',
        amount: '1000000000000000000',
    },
    {
        tokenAddress: '0x435E53e6C5B5E5a13E4874F6C5D7049621C4834D',
        recipient: '0xb7Cd3878c7DfEf409894e66a33aA75C06881E4a5',
        amount: '1000000000000000000',
    }
];

const executeTransaction = async() => {
    const data = await constructBatchedTransferData(metaTx, transfers);
    await executeBatchedTransfers(data);
}