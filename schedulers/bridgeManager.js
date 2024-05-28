const fs = require('fs');
const moment = require('moment');
const { getSwapEventsFromBlockNumber, swapEventsHook } = require('./swapEventsScheduler');
const { getBridgeEventsFromBlockNumber, bridgeEventHook } = require('./bridgeEventsScheduler');
const path = './analytics/bridgeEvents.json';

async function addEvent(event) {
    let events = [];
  
    // Charger les events
    if (fs.existsSync(path)) {
        const data = fs.readFileSync(path);
        events = JSON.parse(data);
    }
  
    // Vérifier si le event existe déjà
    if (!events.some(s => s.hash === event.hash)) {
        // Ajouter le nouveau event avec son hash
        events.push({ ...event });
  
        // Garder uniquement les tx's des 24 dernieres heures
        events = events.filter(x => {
            if (moment(x.timestamp * 1000).add(1, 'day').isAfter(moment())) {
                return true;
            }
            return false;
        });
  
        // Sauvegarder les events
        fs.writeFileSync(path, JSON.stringify(events, null, 2));
        return true;
    }
    return false;
};

const managerBridgesData = async (cb) => {
    if (!fs.existsSync(path)) {
        const initialEventsData = await getBridgeEventsFromBlockNumber(0);

        for (let event of initialEventsData) {
            if (addEvent(event)) {
                cb(event);
            }
        }
    }
    await bridgeEventHook((events) => {
        for (let event of events) {
            if (addEvent(event)) {
                cb(event);
            }
        }
    });
};

const getLastTenEvents = async () => {
    const data = JSON.parse(fs.readFileSync(path).toString());
    return data.slice(-10);
};

const getEvents = async () => {
    if (!fs.existsSync(path)) {
        return [];
    }
    const data = JSON.parse(fs.readFileSync(path).toString());
    return data;
};

module.exports = {
    managerBridgesData,
    getLastTenEvents,
    getEvents
};