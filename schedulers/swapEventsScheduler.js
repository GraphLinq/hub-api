const { ethers } = require("ethers");
const moment = require("moment");
const fs = require('fs');
const { getETHPriceUSD, getGLQPriceUSD } = require("../shared/prices");
const { getPricesInCache } = require("./priceScheduler");

const parseSwapEventData = async (sender, recipient, amount0, amount1, sqrtPriceX96, liquidity, tick, block, txReceipt, gasPrice) => {
    const timestamp = block?.timestamp ?? moment().unix();
    const token0Decimals = 18;
    const token1Decimals = 18;
    const tickOfPrice = 1.0001 ** tick;
    // prix d'une unité du token 1 en token 0
    const priceInToken1 = (tickOfPrice * (10 ** (token0Decimals))) / (10 ** token1Decimals);
    const priceInToken0 = 1 / priceInToken1;

    const prices = await getPricesInCache();

    return {
        pool: 'WETH/WGLQ',
        hash: txReceipt.transactionHash,
        timestamp: timestamp,
        sender: sender,
        recipient: recipient,
        type: Number(ethers.utils.formatEther(amount0)) > 0 ? 'buy' : 'sell',
        amount0: {
            currency: 'WETH',
            amount: Math.abs(Number(ethers.utils.formatEther(amount0))).toFixed(18)
        },
        amount1: {
            currency: 'WGLQ',
            amount: Math.abs(Number(ethers.utils.formatEther(amount1))).toFixed(18)
        },
        price: (priceInToken0 * prices.ETH).toFixed(18),
        gasCostUsed: (Number(ethers.utils.formatEther(txReceipt.gasUsed.mul(gasPrice))) * prices.GLQ).toFixed(18)
    };
}

const environement = JSON.parse(fs.readFileSync('./environment.json'));
const poolWETHGLQAddress = '0x2f734ea5474792513b4EC73B38A2A6c103A12a6f';

const getSwapEventsFromBlockNumber = async (blockNumber) => {
    networkName = 'GLQ';

    const provider = new ethers.providers.JsonRpcProvider({
        url: environement['rpc' + networkName].url,
        name: environement['rpc' + networkName].name,
        chainId: Number(environement['rpc' + networkName].chainId)
    });
    const wallet =  ethers.Wallet.createRandom();
    const account = wallet.connect(provider);

    const lastBlockNumber = blockNumber ?? (await provider.getBlockNumber()) - (3600*4/* one day */);
    const contract = new ethers.Contract(
        poolWETHGLQAddress,
        [
            'event Swap(address indexed sender, address indexed recipient, int256 amount0, int256 amount1, uint160 sqrtPriceX96, uint128 liquidity, int24 tick)'
        ],
        account
    );
    let eventFilter = contract.filters.Swap();
    let events = await contract.queryFilter(eventFilter, lastBlockNumber);
    const lastEvents = events.slice(-10);
    let latestsSwapEvents = [];
    for (let event of lastEvents) {
        const block = await event.getBlock();
        const txReceipt = await event.getTransactionReceipt();
        const gasPrice = await provider.getGasPrice();
        const eventResult = await parseSwapEventData(event.args.sender, event.args.recipient, event.args.amount0, event.args.amount1, event.args.sqrtPriceX96, event.args.liquidity, event.args.tick, block, txReceipt, gasPrice);
        console.log(eventResult);
        latestsSwapEvents.push(eventResult);
    }
    return latestsSwapEvents;
}

const swapEventsHook = async (cb) => {
    networkName = 'GLQ';

    const provider = new ethers.providers.JsonRpcProvider({
        url: environement['rpc' + networkName].url,
        name: environement['rpc' + networkName].name,
        chainId: Number(environement['rpc' + networkName].chainId)
    });
    const wallet =  ethers.Wallet.createRandom();
    const account = wallet.connect(provider);

    const lastBlockNumber = await provider.getBlockNumber();

    const contract = new ethers.Contract(
        '0x2f734ea5474792513b4EC73B38A2A6c103A12a6f',
        [
            'event Swap(address indexed sender, address indexed recipient, int256 amount0, int256 amount1, uint160 sqrtPriceX96, uint128 liquidity, int24 tick)'
        ],
        account
    );

    const lastDayBlockNumber = lastBlockNumber - (3600*4/* one day */);

    let eventFilter = contract.filters.Swap()

    contract.on(eventFilter, async (sender, recipient, amount0, amount1, sqrtPriceX96, liquidity, tick) => {
        
        const lastBlockNumber = await provider.getBlockNumber();
        cb(await getSwapEventsFromBlockNumber(lastBlockNumber - 100));
    });
};

module.exports = {
    getSwapEventsFromBlockNumber,
    swapEventsHook
};