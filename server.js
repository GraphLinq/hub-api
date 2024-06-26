const { priceScheduler, pricesScheduler, savePrices, getPricesInCache } = require('./schedulers/priceScheduler');
const { swapEventsHook, getSwapEventsFromBlockNumber } = require('./schedulers/swapEventsScheduler');
const fs = require('fs');
const { managerSwapsData, addSwap } = require('./schedulers/swapManager');
const { getStakingTVL, saveStakingTVL } = require('./schedulers/stakingScheduler');
const { getTotalLiquidAssetsOnChain, saveTotalLiquidAssetsOnChain } = require('./schedulers/totalLiquidAssetsOnChainScheduler');
const { getChallengesAccount, saveChallengesAccount } = require('./challengesAccounts');
const { bridgeEventHook } = require('./schedulers/bridgeEventsScheduler');
const { managerBridgesData } = require('./schedulers/bridgeManager');
const { ethers } = require("ethers");
const moment = require("moment");

var express = require('express'),
    app = express(),
    port = process.env.PORT || 8080,// if un exposed port execute : sudo ufw allow 8080
    cors = require('cors'),
    bodyParser = require('body-parser');

/////////////////////////////////////////////////////////////////////////
//Json BodyParser
/////////////////////////////////////////////////////////////////////////

// var allowedOrigins = ['*'];

// app.use(cors({
//     origin: function(origin, callback) {
//       // allow requests with no origin 
//       // (like mobile apps or curl requests)
//       if (!origin) return callback(null, true);
//       if (allowedOrigins.indexOf('*') === -1 && allowedOrigins.indexOf(origin) === -1) {
//         var msg = 'The CORS policy for this site does not ' +
//                   'allow access from the specified Origin.';
//         console.log('Origin blocked by CORS policy ', origin);
//         return callback(new Error(msg), false);
//       }
//       return callback(null, true);
//     }
// }));
// app.use(function (req, res, next) {
//   res.setHeader('Access-Control-Allow-Origin', '*');
//   res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
//   res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
//   next();
// });


JSON.parseAll = (v) => { try { return typeof v == "string" ? JSON.parse(v) : v; } catch (x) { return v; } }
String.prototype.isEmpty = function() { return (this == ""); };
String.prototype.nonEmpty = function() { return (this != ""); };
String.prototype.fixStringNumberOfCharacters = function(l = 10) { var r = ""; for (var i = 0; i < (l + 1); i++) { if (this.length > i) { r += this[i]; } else if (this.length == i) { r += " "; } else { r += "."; } } return r; }


/////////////////////////////////////////////////////////////////////////
//Json BodyParser
/////////////////////////////////////////////////////////////////////////

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Plugins:
[
    require("./plugins/swagger/swagger"),
    require("./plugins/event/fire"),
    require('./plugins/scheduler/scheduler'),
    require('./plugins/evm-event-manager/evm-event-manager'),
    () => {
      /** @FireEventHandler ON_SCHEDULE_CREATE */
      app.fire.create("ON_SCHEDULE_CREATE", (models) => {
        console.log("Start scheduleTime (1000)");
        // creation of the main analytics directory storage
        if (!fs.existsSync('./analytics')) {
          fs.mkdirSync('./analytics');
        }
        app.scheduler.create("mainScheduler", '*/60 * * * *', () => app.fire.call["ON_SCHEDULE"](), true);
      });

      app.fire.create("ON_SCHEDULE", async () => {
        console.log("scheduleTime");

        try {
          const stakingTVL = await getStakingTVL();
          saveStakingTVL(stakingTVL);
        } catch (e) {
          console.error('Staking TVL Scheduler', e);
        }

        try {
          const tvl = await getTotalLiquidAssetsOnChain();
          saveTotalLiquidAssetsOnChain(tvl);
        } catch (e) {
          console.error('Total Liquid Assets On Chain Scheduler', e);
        }

        try {
          const data = await pricesScheduler();
          savePrices(data);
        } catch (e) {
          console.error('Prices Scheduler', e);
        }
      });
    },
    require('./routes')
].forEach(plugin => plugin(app));

/////////////////////////////////////////////////////////////////////////
//Start Server
/////////////////////////////////////////////////////////////////////////

app.listen(port);

// console.log('Allowed origins            : ', allowedOrigins);
console.log('API server started on port : ', port);
app.fire.call["ON_SCHEDULE_CREATE"]();

/// Do Bridge Events
app.evmEventManager.do(
  'evmEventManager-BridgeEvents',
  'ETH',
  18000000,
  '0x1973006F6bA037e70967A1bB2A15c5432361c5fE',
  ['event BridgeTransfer(uint256 amount, string toChain)'],
  'BridgeTransfer',
    async (event) => {
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
  }, (newBridge) => {
    try {
      const account = getChallengesAccount(newBridge.from);
      if (account.bridges === undefined) {
        account.bridges = {};
      }
      if (account.hashs === undefined) {
        account.hashs = [];
      }
      if (account.bridges[newBridge.toChain] === undefined) {
        account.bridges[newBridge.toChain] = 0;
      }
      if (account.hashs.includes(newBridge.hash)) { // already accounted
        return ;
      }
      account.hashs.push(newBridge.hash);
      account.bridges[newBridge.toChain] += Number(newBridge.amount);
      saveChallengesAccount(account);
    } catch(e) {
      console.log(e);
    }
  });

app.evmEventManager.do(
  'evmEventManager-SwapsEvents',
  'GLQ',
  1500000,
  '0x2f734ea5474792513b4EC73B38A2A6c103A12a6f',
  ['event Swap(address indexed sender, address indexed recipient, int256 amount0, int256 amount1, uint160 sqrtPriceX96, uint128 liquidity, int24 tick)'],
  'Swap',
    async (event, provider) => {

    const block = await event.getBlock();
    const txReceipt = await event.getTransactionReceipt();
    const gasPrice = await provider.getGasPrice();
    const timestamp = block?.timestamp ?? moment().unix();
    const token0Decimals = 18;
    const token1Decimals = 18;
    const tickOfPrice = 1.0001 ** event.args.tick;
    const priceInToken1 = (tickOfPrice * (10 ** (token0Decimals))) / (10 ** token1Decimals);
    const priceInToken0 = 1 / priceInToken1;
    const prices = await getPricesInCache();

    return {
      pool: 'WETH/WGLQ',
      hash: txReceipt.transactionHash,
      timestamp: timestamp,
      sender: event.args.sender,
      recipient: event.args.recipient,
      type: Number(ethers.utils.formatEther(event.args.amount0)) > 0 ? 'buy' : 'sell',
      amount0: {
          currency: 'WETH',
          amount: Math.abs(Number(ethers.utils.formatEther(event.args.amount0))).toFixed(18)
      },
      amount1: {
          currency: 'WGLQ',
          amount: Math.abs(Number(ethers.utils.formatEther(event.args.amount1))).toFixed(18)
      },
      price: (priceInToken0 * prices.ETH).toFixed(18),
      gasCostUsed: (Number(ethers.utils.formatEther(txReceipt.gasUsed.mul(gasPrice))) * prices.GLQ).toFixed(18)
    };
  }, async (newSwap) => {
    await addSwap(newSwap);
    if (newSwap.pool === 'WETH/WGLQ') {
      try {
        const account = getChallengesAccount(newSwap.recipient);

        if (account.swaps === undefined) {
          account.swaps = {};
        }
        if (account.hashs === undefined) {
          account.hashs = [];
        }
        if (account.swaps['WETH/WGLQ'] == undefined || account.swaps['WETH/WGLQ'] === true) {
          account.swaps['WETH/WGLQ'] = 0;
        }
        if (account.hashs.includes(newSwap.hash)) { // already accounted
          return ;
        }
        account.hashs.push(newSwap.hash);
        if (newSwap.amount0.currency === 'WGLQ') {
          const amountOfWGLQInUSD = Number(newSwap.price) * Number(newSwap.amount0.amount);
          account.swaps['WETH/WGLQ'] += Number(amountOfWGLQInUSD);
        }
        if (newSwap.amount1.currency === 'WGLQ') {
          const amountOfWGLQInUSD = Number(newSwap.price) * Number(newSwap.amount1.amount);
          account.swaps['WETH/WGLQ'] += Number(amountOfWGLQInUSD);
        }
        saveChallengesAccount(account);
      } catch (e) {
        console.log(e);
      }
    }
  });

const evmPositionsEvents = [
  ['evmEventManager-PositionsEvents-10000', '0x2f734ea5474792513b4EC73B38A2A6c103A12a6f'], // 1% pool
  ['evmEventManager-PositionsEvents-3000', '0x04391851210bd132ADDe72De7f07ACede7b4AD97'], // 0.30% pool
  ['evmEventManager-PositionsEvents-500', '0xe08b108059c7312A905D633315caeA19755114fe'], // 0.05% pool
  ['evmEventManager-PositionsEvents-100', '0xc6CD370f2648AACE07C7C9612A88243ADef97D8B'] // 0.01% pool
];

for (let eventDo of evmPositionsEvents) {
  app.evmEventManager.do(
    eventDo[0], // 1%
    'GLQ',
    2100000,
    eventDo[1],
    ['event Mint(address sender, address indexed owner, int24 indexed tickLower, int24 indexed tickUpper, uint128 amount, uint256 amount0, uint256 amount1)'],
    'Mint',
      async (event, provider) => {
        const txReceipt = await event.getTransactionReceipt();

        return {
          pool: 'WETH/WGLQ',
          hash: event.transactionHash,
          from: txReceipt.from,
          amount0: {
            currency: 'WETH',
            amount: Math.abs(Number(ethers.utils.formatEther(event.args.amount0))).toFixed(18)
          },
          amount1: {
            currency: 'WGLQ',
            amount: Math.abs(Number(ethers.utils.formatEther(event.args.amount1))).toFixed(18)
          },
        };
    }, (newMint) => {
      try {
        console.log(newMint);
        const account = getChallengesAccount(newMint.from);
        if (account.liquidityPoolsPositions === undefined) {
          account.liquidityPoolsPositions = {};
        }
        if (account.liquidityPools !== undefined) {
          delete account.liquidityPools;
        }
        if (account.hashs === undefined) {
          account.hashs = [];
        }
        if (account.hashs.includes(newMint.hash)) { // already accounted
          return ;
        }
        account.hashs.push(newMint.hash);
        if (account.liquidityPoolsPositions[newMint.pool] === undefined || account.liquidityPoolsPositions[newMint.pool][newMint.amount0.currency] === undefined) {
          account.liquidityPoolsPositions[newMint.pool] = {
            [newMint.amount0.currency]: 0,
            [newMint.amount1.currency]: 0
          };
        }
        account.liquidityPoolsPositions[newMint.pool][newMint.amount0.currency] += Number(newMint.amount0.amount);
        account.liquidityPoolsPositions[newMint.pool][newMint.amount1.currency] += Number(newMint.amount1.amount);
        saveChallengesAccount(account);
      } catch(e) {
        console.log(e);
      }
    }, 10000);
}