const { ethers } = require("ethers");
const fs = require('fs');
const { getGLQPriceUSD, getETHPriceUSD } = require("../shared/prices");

const path = './analytics/totalLiquidAssetsOnChain.json';
const getTotalLiquidAssetsOnChain = async () => {
    const environement = JSON.parse(fs.readFileSync('./environment.json'));
    const networkName = 'ETH';
    const provider = new ethers.providers.JsonRpcProvider({
        url: environement['rpc' + networkName].url,
        name: environement['rpc' + networkName].name,
        chainId: Number(environement['rpc' + networkName].chainId)
    });
    const wallet =  ethers.Wallet.createRandom();
    const account = wallet.connect(provider);

    const bridgesAddresses = [
        {
            bridgeAddress: '0x1973006F6bA037e70967A1bB2A15c5432361c5fE',
            converter: async (value) => (value * (await getETHPriceUSD())).toFixed(18),
            native: true,
        }, // ETH
        {
            tokenAddress: '0x9F9c8ec3534c3cE16F928381372BfbFBFb9F4D24',
            bridgeAddress: '0x379D5fDD6808CE6Fc7E1450F85c98c8312CC82ca',
            converter: async (value) => (value * (await getGLQPriceUSD())).toFixed(18)
        } // GLQ
    ];
    let totalLiquidAssetsOnChainValue = '0';
    for (let bridge of bridgesAddresses) {
        if (bridge.native !== undefined) {
            const balanceInETH = await provider.getBalance(bridge.bridgeAddress);
            const tvlInUSD = await bridge.converter(Number(ethers.utils.formatEther(balanceInETH)));

            totalLiquidAssetsOnChainValue = (Number(totalLiquidAssetsOnChainValue) + Number(tvlInUSD)).toFixed(18);
            console.log('ETH Balance', ethers.utils.formatEther(balanceInETH));
            continue ;
        }

        const contract = new ethers.Contract(
            bridge.tokenAddress,
            [
                'function balanceOf(address owner) external view returns (uint256 balance)'
            ],
            account
        );

        const balanceInToken = await contract.balanceOf(bridge.bridgeAddress);
        const tokenTvlInUSD = await bridge.converter(Number(ethers.utils.formatEther(balanceInToken)));
        console.log('GLQ Balance', ethers.utils.formatEther(balanceInToken));
        totalLiquidAssetsOnChainValue = (Number(totalLiquidAssetsOnChainValue) + Number(tokenTvlInUSD)).toFixed(18);
    }
    return totalLiquidAssetsOnChainValue;
};

const saveTotalLiquidAssetsOnChain = (value) => {
    fs.writeFileSync(path, JSON.stringify({ value }));
};

const getTotalLiquidAssetsOnChainInCache = async () => {
    if (!fs.existsSync(path)) {
        const value = await getTotalLiquidAssetsOnChain();
        saveTotalLiquidAssetsOnChain(value);
        return value;
    }
    return JSON.parse(fs.readFileSync(path)).value;
}


module.exports = {
    saveTotalLiquidAssetsOnChain,
    getTotalLiquidAssetsOnChainInCache,
    getTotalLiquidAssetsOnChain
}