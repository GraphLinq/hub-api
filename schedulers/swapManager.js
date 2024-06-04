const fs = require('fs');
const moment = require('moment');
const { getSwapEventsFromBlockNumber, swapEventsHook } = require('./swapEventsScheduler');
const path = './analytics/swaps.json';

async function addSwap(swap) {
    let swaps = [];
  
    // Charger les swaps existants
    if (fs.existsSync(path)) {
        const data = fs.readFileSync(path);
        swaps = JSON.parse(data);
    }
  
    // Vérifier si le swap existe déjà
    if (!swaps.some(s => s.hash === swap.hash)) {
        // Ajouter le nouveau swap avec son hash
        swaps.push({ ...swap });
  
        // Garder uniquement les tx's des 24 dernieres heures
        swaps = swaps.filter(x => {
            if (moment(x.timestamp * 1000).add(1, 'day').isAfter(moment())) {
                return true;
            }
            return false;
        });
  
        // Sauvegarder les swaps mis à jour
        fs.writeFileSync(path, JSON.stringify(swaps, null, 2));
        return true;
    }
    return false;
};

const managerSwapsData = async (cb) => {
    if (!fs.existsSync(path)) {
        const initialSwapsData = await getSwapEventsFromBlockNumber(0);

        for (let swap of initialSwapsData) {
            if (addSwap(swap)) {
                cb(swap);
            }
        }
    }
    await swapEventsHook((swaps) => {
        for (let swap of swaps) {
            if (addSwap(swap)) {
                cb(swap);
            }
        }
    });
};

const getLastTenSwaps = async () => {
    const data = JSON.parse(fs.readFileSync(path).toString());
    return data.slice(-10);
};

const getSwaps = async () => {
    if (!fs.existsSync(path)) {
        return [];
    }
    const data = JSON.parse(fs.readFileSync(path).toString());
    return data;
};

module.exports = {
    managerSwapsData,
    getLastTenSwaps,
    getSwaps,
    addSwap
};