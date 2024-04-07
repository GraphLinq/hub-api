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
const { getPricesInCache } = require('../../schedulers/priceScheduler');

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
            const prices = await getPricesInCache();
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

            swapAnalytics.volume = (swapAnalytics.volume * Number(prices.ETH)).toFixed(18);

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
                preferedPool: 'WETH/WGLQ',
                prices: prices
            };

            cache.time = moment().toDate().getTime();
            cache.data = result;
            res.send(cache.data);
        })
};

module.exports = PriceResourceController;
