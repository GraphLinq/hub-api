const { getUniswapV3TokenPrice } = require("../plugins/uniswapv3/uniswapv3-information");
const fs = require('fs');

const getETHPriceUSD = async () => {
    const environement = JSON.parse(fs.readFileSync('./environment.json'));
    const priceInUSDT = await getUniswapV3TokenPrice(
        '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', // WETH
        '0xdAC17F958D2ee523a2206206994597C13D831ec7', // USDT
        '0x4e68ccd3e89f51c3074ca5072bbac773960dfa36', {
            environement: environement
        }, 'ETH');
    return priceInUSDT;
}

const getGLQPriceUSD = async () => {
    const environement = JSON.parse(fs.readFileSync('./environment.json'));
    const priceInUSDT = await getETHPriceUSD();

    // // Ethereum Chain
    // const priceInWETH = await getUniswapV3TokenPrice(
    //     '0x9f9c8ec3534c3ce16f928381372bfbfbfb9f4d24', // GLQ
    //     '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
    //     '0xc3881fbb90daf3066da30016d578ed024027317c', {
    //         environement: environement
    //     }, 'ETH');

    const numberOfGLQForOneWETH = await getUniswapV3TokenPrice(
        '0xEB567ec41738c2bAb2599A1070FC5B727721b3B6', // WGLQ
        '0xbeED106D0f2e6950BFa1Eec74E1253CA0a643442', // WETH
        '0x2f734ea5474792513b4EC73B38A2A6c103A12a6f', {
            environement: environement
        }, 'GLQ');

    return (Number(priceInUSDT)/Number(numberOfGLQForOneWETH)).toFixed(18);
};

module.exports = {
    getGLQPriceUSD,
    getETHPriceUSD
}