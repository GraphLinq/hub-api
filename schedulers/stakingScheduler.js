const { ethers } = require('ethers');
const fs = require('fs');
const { getGLQPriceUSD } = require('../shared/prices');
const path = './analytics/stakingTVL.json';

const getStakingTVL = async () => {
    const environement = JSON.parse(fs.readFileSync('./environment.json'));
    const stakingAddress = '0xC09062656C4715085d7D345B25a8D8A7ee477521';

    networkName = 'GLQ';

    const provider = new ethers.providers.JsonRpcProvider({
        url: environement['rpc' + networkName].url,
        name: environement['rpc' + networkName].name,
        chainId: Number(environement['rpc' + networkName].chainId)
    });

    const balanceInGLQ = await provider.getBalance(stakingAddress);
    const glqPriceInUSD = await getGLQPriceUSD();

    return (Number(ethers.utils.formatEther(balanceInGLQ).toString()) * Number(glqPriceInUSD)).toFixed(18);
};

const saveStakingTVL = (stakingTVL) => {
    fs.writeFileSync(path, JSON.stringify({ stakingTVL: stakingTVL }));
};

const getStakingTVLInCache = async () => {
    if (!fs.existsSync(path)) {
        const stakingTVL = await getStakingTVL();
        saveStakingTVL(stakingTVL);
        return stakingTVL;
    }
    return JSON.parse(fs.readFileSync(path)).stakingTVL;
}

module.exports = {
    getStakingTVL,
    saveStakingTVL,
    getStakingTVLInCache
};