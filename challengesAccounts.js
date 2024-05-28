const fs = require('fs');

const path = './analytics/challenges-accounts.json';

const getAllChallengesAccounts = () => {
    if (fs.existsSync(path)) {
        const json = JSON.parse(fs.readFileSync(path).toString());
        return json;
    }
    return {};
};

const getChallengesAccount = (address) => {
    if (fs.existsSync(path)) {
        const json = JSON.parse(fs.readFileSync(path).toString());
        if (json[address] !== undefined) {
            return json[address];
        }
    }
    return { address: address, rewards: 0, challenges: [], claims: [] };
};

const saveChallengesAccount = (account) => {
    if (account.address === undefined) {
        return false;
    }
    let allRewards = getAllChallengesAccounts();
    allRewards[account.address] = account;
    fs.writeFileSync(path, JSON.stringify(allRewards));
    return true;
};

module.exports = {
    getAllChallengesAccounts,
    getChallengesAccount,
    saveChallengesAccount
};