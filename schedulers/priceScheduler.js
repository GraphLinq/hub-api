const fs = require('fs');
const { getGLQPriceUSD, getETHPriceUSD } = require("../shared/prices");
const path = './analytics/prices.json';

const pricesScheduler = async () => {
    const priceOfETHInUSD = await getETHPriceUSD();
    const priceOfGLQInUSD = await getGLQPriceUSD();

    return {
        ETH: priceOfETHInUSD,
        GLQ: priceOfGLQInUSD
    };
};

const savePrices = (value) => {
    fs.writeFileSync(path, JSON.stringify(value));
};

const getPricesInCache = async () => {
    if (!fs.existsSync(path)) {
        const value = await pricesScheduler();
        savePrices(value);
        return value;
    }
    return JSON.parse(fs.readFileSync(path));
}

module.exports = {
    pricesScheduler,
    getPricesInCache,
    savePrices
};