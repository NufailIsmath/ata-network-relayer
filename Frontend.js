const web3 = new Web3(window.ethereum);

function parseSignature(signature) {
    const sigParams = signature.substr(2);
    const r = `0x${sigParams.substr(0, 64)}`;
    const s = `0x${sigParams.substr(64, 64)}`;
    const v = parseInt(sigParams.substr(128, 2), 16);

    return {
        v,
        r,
        s
    };
}

async function signMessage() {
    if (window.ethereum) {
        const web3 = new Web3(window.ethereum);
        try {
            // Request account access if needed
            await window.ethereum.enable();
        } catch (error) {
            // User denied account access...
        }
    } else {
        console.log('No web3 provider detected');
    }
    // Message to sign
    const contractId = "0xFE519650FbcE47D220B99dF149a50b9515E79691"; //"0x26911B0F3eCdF8dF3c7f7AF2a0a3Ae8a340e2F27";

    const chainId = 80001;

    let domainData = {
        name: "BatchedERC20Transfer",
        version: "1",
        chainId: chainId, // Matic Testnet
        verifyingContract: contractId,
    };

    const domainType = [{
            name: "name",
            type: "string"
        },
        {
            name: "version",
            type: "string"
        },
        {
            name: "chainId",
            type: "uint256"
        },
        {
            name: "verifyingContract",
            type: "address"
        },
    ];

    const MetaTransactionData = [{
            name: "from",
            type: "address"
        },
        {
            name: "nonce",
            type: "uint256"
        },
        {
            name: "relayer",
            type: "address"
        },
        {
            name: "functionSignature",
            type: "bytes"
        },
    ]

    //const Contract = new web3.eth.Contract(BATCHED_ERC20_TRANSFER_ABI, contractId);

    const nonce = 0;

    let message = {};

    message.from = "0x951cea7fFdC2E05c209f47c2d32c70F7ac70Dda1"
    message.nonce = nonce;
    message.relayer = "0x73c0D20aB453aD893db78998c7f4c47ED9D86837"
    message.functionSignature = "0x00" //Contract.methods.executeBatchedERC20Transfers().encodeABI();


    const dataToSign = JSON.stringify({
        types: {
            EIP712Domain: domainType,
            MetaTransaction: MetaTransactionData,
        },
        domain: domainData,
        primaryType: "MetaTransaction",
        message: message
    })

    var from = await web3.eth.getAccounts();

    var params = [from[0], dataToSign];
    var method = 'eth_signTypedData_v4';

    web3.currentProvider.sendAsync({
            method,
            params,
            from: from[0],
        },
        function(err, result) {
            if (err) return console.dir(err);
            if (result.error) {
                alert(result.error.message);
            }
            if (result.error) return console.error('ERROR', result);
            console.log('TYPED SIGNED:' + JSON.stringify(result.result));
            console.log(parseSignature(result.result))

            /* const recovered = web3.eth.accounts.recoverTypedSignature_v4({
              data: dataToSign,
              sig: result.result,
            }); */

            const signatureParams = web3.eth.accounts._parseSignature(result.result);
            const sigHash = web3.utils.sha3("\x19\x01" + web3.utils.hexToBytes(signatureParams.v) + web3.utils.sha3(dataToSign));

            const recovered = web3.eth.accounts.recover(result.result, web3.utils.hexToNumber(signatureParams.v), web3.utils.hexToBytes(signatureParams.r), web3.utils.hexToBytes(signatureParams.s));

            if (
                ethUtil.toChecksumAddress(recovered) === ethUtil.toChecksumAddress(from)
            ) {
                alert('Successfully recovered signer as ' + from);
            } else {
                alert(
                    'Failed to verify signer when comparing ' + result + ' to ' + from
                );
            }
        }
    );

}


signMessage()