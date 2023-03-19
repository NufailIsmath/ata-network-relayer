const domainName = "Token1" // put your token name 
const domainVersion = "1" // leave this to "1"
const chainId = 80001 // this is for the chain's ID. value is 1 for remix
const contractAddress = "0x33cF1ad68657574e8747D596Fab86C5E7E369BC4" // Put the address here from remix

const web3 = new Web3(window.ethereum);

const domain = {
    name: domainName,
    version: domainVersion,
    verifyingContract: contractAddress,
    chainId
}

const domainType = [{
        name: 'name',
        type: 'string'
    },
    {
        name: 'version',
        type: 'string'
    },
    {
        name: 'chainId',
        type: 'uint256'
    },
    {
        name: 'verifyingContract',
        type: 'address'
    },
]

const sign = async(spender, value, nonce, deadline) => {
    const accounts = await web3.eth.getAccounts();
    const account = accounts[0];
    console.log(account);

    const permit = {
        owner: account,
        spender,
        value,
        nonce,
        deadline
    };

    const Permit = [{
            name: "owner",
            type: "address"
        },
        {
            name: "spender",
            type: "address"
        },
        {
            name: "value",
            type: "uint256"
        },
        {
            name: "nonce",
            type: "uint256"
        },
        {
            name: "deadline",
            type: "uint256"
        },
    ]
}


sign();