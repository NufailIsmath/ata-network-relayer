const { ethers } = require("ethers");
require("dotenv").config();

const BatchedERC20TransferABI = require("./ABI/BatchedERC20Transfer.json");

const provider = new ethers.providers.JsonRpcProvider("");

const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

const contractAddress = "";

const contract = new ethers.Contract(contractAddress, BatchedERC20TransferABI, wallet);

async function executeBatchedERC20Transfers(from, transfers, functionSignature, nonce) {
    const metaTx = {
        from,
        nonce,
        relayer: wallet.address,
        functionSignature,
    };

    // Generate domain separator and message digest
    const domainSeparator = ethers.utils.keccak256(
        ethers.utils.defaultAbiCoder.encode(
            [
                "bytes32",
                "bytes32",
                "bytes32",
                "uint256",
                "address",
            ], [
            ethers.utils.keccak256(
                ethers.utils.toUtf8Bytes("EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)")
            ),
            ethers.utils.keccak256(ethers.utils.toUtf8Bytes("BatchedERC20Transfer")),
            ethers.utils.keccak256(ethers.utils.toUtf8Bytes("1.0.0")),
            1, // Replace with the chain ID of the network
            BatchedERC20Transfer.address, // Replace with the address of the BatchedERC20Transfer contract
        ]
        )
    );

    const metaTransactionType = {
        MetaTransactionData: [
            { name: "from", type: "address" },
            { name: "nonce", type: "uint256" },
            { name: "relayer", type: "address" },
            { name: "functionSignature", type: "bytes" },
        ],
    };

    const _metaTransactionTypeHash = ethers.utils.keccak256(
        ethers.utils.defaultAbiCoder.encode(
            ["bytes32", "bytes32[]"], [ethers.utils.keccak256(ethers.utils.toUtf8Bytes("MetaTransactionData(address from,uint256 nonce,address relayer,bytes functionSignature)")), metaTransactionType.MetaTransactionData.map((x) => ethers.utils.keccak256(ethers.utils.toUtf8Bytes(`${x.type} ${x.name}`)))],
        ),
    );
    const digest = ethers.utils.keccak256(
        ethers.utils.solidityPack(
            ["bytes1", "bytes1", "bytes32", "bytes32"], [
            "0x19",
            "0x01",
            domainSeparator,
            ethers.utils.keccak256(
                ethers.utils.defaultAbiCoder.encode(
                    [
                        "bytes32",
                        "address",
                        "uint256",
                        "address",
                        "bytes",
                    ], [
                    _metaTransactionTypeHash,
                    metaTx.from,
                    metaTx.nonce,
                    metaTx.relayer,
                    ethers.utils.keccak256(metaTx.functionSignature),
                ]
                )
            ),
        ]
        )
    );

    // Sign the message digest
    const { v, r, s } = await wallet.signMessage(ethers.utils.arrayify(digest));

    // Call the executeBatchedERC20Transfers function of the BatchedERC20Transfer contract
    await contract.executeBatchedERC20Transfers(metaTx, transfers, v, r, s);
}