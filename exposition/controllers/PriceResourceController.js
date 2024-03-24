'use strict';
const { AddRoute, Validation, ValidationStep } = require('../../shared/services/security/Filter');
const { Code } = require('../../shared/services/security/Code');
const { getUniswapV3AmountOut, getUniswapV3Information, getUniswapV3TokenPrice } = require('../../plugins/uniswapv3/uniswapv3-information');
const { ethers } = require('ethers');
const { getSwaps } = require('../../schedulers/swapManager');
const fs = require('fs');
const moment = require('moment');
const { getStakingTVL, getStakingTVLInCache } = require('../../schedulers/stakingScheduler');
const { getTotalLiquidAssetsOnChainInCache } = require('../../schedulers/totalLiquidAssetsOnChainScheduler');

const cache = {
    time: 0,
    data: undefined
};

const PriceResourceController = {
    /**
     * /stats
     * EXPOSED ROUTE
     */
    stats: (app, type, route) => AddRoute(app, type, route,
        //////////////////////////////////////////////////////////
        // Validation ->
        //////////////////////////////////////////////////////////
        [],
        //////////////////////////////////////////////////////////
        // Entry point ->
        //////////////////////////////////////////////////////////
        async (req, res) => {
            if (cache.data !== undefined && moment(cache.time).add(1, 'minute').isAfter(moment())) {
                res.send(cache.data);
                return ;
            }
            const environement = JSON.parse(fs.readFileSync('./environment.json'));
            const priceInUSDT = await getUniswapV3TokenPrice(
                '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', // WETH
                '0xdAC17F958D2ee523a2206206994597C13D831ec7', // USDT
                '0x4e68ccd3e89f51c3074ca5072bbac773960dfa36', {
                    environement: environement
                }, 'ETH');
            const swaps = await getSwaps();
            const swapAnalytics = swaps.reduce((acc, s) => {
                if (acc.highPrice < Number(s.price)) {
                    acc.highPrice = Number(s.price);
                }
                if (acc.lowPrice > Number(s.price)) {
                    acc.lowPrice = Number(s.price);
                }
                acc.volume += Number(s.amount0.amount);
                acc.WGLQSwap24h += Number(s.amount1.amount);

                return acc;
            }, {
                highPrice: 0,
                lowPrice: 500000,
                volume: 0,
                WGLQSwap24h: 0
            });

            const entryPrice = swaps.length > 0 ? swaps[0].price : '0';
            const closePrice = swaps.length > 0 ? swaps[swaps.length - 1].price : '0';

            swapAnalytics.volume = (swapAnalytics.volume * Number(priceInUSDT)).toFixed(18);

            const lastsSwaps = swaps.slice(-10);
            const stakingTVL = await getStakingTVLInCache();
            const totalLiquidAssetsOnChain = await getTotalLiquidAssetsOnChainInCache();
            const result = {
                analytics: {
                    ... swapAnalytics,
                    entryPrice,
                    closePrice
                },
                swaps: lastsSwaps,
                totalLiquidAssetsOnChain: totalLiquidAssetsOnChain,
                stakingTVL: stakingTVL,
                preferedPool: 'WETH/WGLQ'
            };

            cache.time = moment().toDate().getTime();
            cache.data = result;
            res.send(cache.data);
        })
};

module.exports = PriceResourceController;
