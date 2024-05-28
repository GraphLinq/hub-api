const fs = require('fs');
const { ethers } = require("ethers");
const moment = require("moment");
const path = './analytics/bridgeEvents.json';

const environement = JSON.parse(fs.readFileSync('./environment.json'));

const getNetworkProvider = (networkName) => {
    const provider = new ethers.providers.JsonRpcProvider({
        url: environement['rpc' + networkName].url,
        name: environement['rpc' + networkName].name,
        chainId: Number(environement['rpc' + networkName].chainId)
    });
    return provider;
}

const getBridgeEventContract = () => {
    const provider = getNetworkProvider('ETH');
    const wallet =  ethers.Wallet.createRandom();
    const account = wallet.connect(provider);
    const contract = new ethers.Contract(
        '0x1973006F6bA037e70967A1bB2A15c5432361c5fE',
        [
            'event BridgeTransfer(uint256 amount, string toChain)'
        ],
        account
    );
    return contract;
}

const formatEvent = async (event) => {
    const block = await event.getBlock();
    const txReceipt = await event.getTransactionReceipt();
    const amount = Math.abs(Number(ethers.utils.formatEther(event.args.amount))).toFixed(18);
    const toChain = event.args.toChain;
    const hash = txReceipt.transactionHash;
    const from = txReceipt.from;
    const timestamp = block?.timestamp ?? moment().unix();

    return {
        from: from,
        hash: hash,
        amount: amount,
        toChain: toChain,
        timestamp: timestamp
    };
}

const getBridgeEventsFromBlockNumber = async (fromBlockNumber = 1, toBlockNumber = undefined) => {
    const contract = getBridgeEventContract();
    const eventFilter = contract.filters.BridgeTransfer();
    const events = await contract.queryFilter(eventFilter, fromBlockNumber, toBlockNumber);
    let latestsEvents = [];
    
    for (let event of events) {
        const eventResult = await formatEvent(event);
        latestsEvents.push(eventResult);
    }
    return latestsEvents;
}

const bridgeEventHook = async (cb) => {
    const provider = getNetworkProvider('ETH');
    const lastBlockNumber = await provider.getBlockNumber();
    const contract = getBridgeEventContract();

    await getBridgeEventsFromBlockNumber(lastBlockNumber - 100000);

    let eventFilter = contract.filters.BridgeTransfer();
    contract.on(eventFilter, async () => {
        const lastBlockNumber = await provider.getBlockNumber();
        cb(await getBridgeEventsFromBlockNumber(lastBlockNumber - 100));
    });
};

const saveEvents = (value) => {
    fs.writeFileSync(path, JSON.stringify(value));
};

module.exports = {
    bridgeEventHook,
    saveEvents,
    getBridgeEventsFromBlockNumber
};