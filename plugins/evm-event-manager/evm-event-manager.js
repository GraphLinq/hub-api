'use strict';

const { ethers } = require("ethers");
const fs = require('fs');

const environement = JSON.parse(fs.readFileSync('./environment.json'));

module.exports = function(app) {
    app.evmEventManager = {
        events: {},
        db: {
            save: (key, event) => {
                let data = {};
                if (fs.existsSync(`./analytics/${key}.json`)) {
                    data = JSON.parse(fs.readFileSync(`./analytics/${key}.json`).toString());
                }
                data[event.hash] = event;
                fs.writeFileSync(`./analytics/${key}.json`, JSON.stringify(data));
            },
            exists: (key, hash) => {
                if (!fs.existsSync(`./analytics/${key}.json`)) {
                    return false;
                }
                const data = JSON.parse(fs.readFileSync(`./analytics/${key}.json`).toString());
                return data[hash] ? true : false;
            },
            get: (key, hash) => {
                if (!fs.existsSync(`./analytics/${key}.json`)) {
                    return undefined;
                }
                const data = JSON.parse(fs.readFileSync(`./analytics/${key}.json`).toString());
                return data[hash];
            }
        },
        do: (key, networkName, defaultStartBlockNumber = 1, contractAddress, contractFunctions, eventFunctionName, eventFormatterFn, callbackNewEventFn) => {
            setTimeout(async () => {
                const getNetworkProvider = (networkName) => {
                    const provider = new ethers.providers.JsonRpcProvider({
                        url: environement['rpc' + networkName].url,
                        name: environement['rpc' + networkName].name,
                        chainId: Number(environement['rpc' + networkName].chainId)
                    });
                    return provider;
                };
                const getEventContract = (provider, contractAddress, contractFunctions) => {
                    const wallet =  ethers.Wallet.createRandom();
                    const account = wallet.connect(provider);
                    const contract = new ethers.Contract(
                        contractAddress,
                        contractFunctions,
                        account
                    );
                    return contract;
                }

                const getEventsFromBlockNumber = async (provider, contractAddress, contractFunctions, eventFunctionName, fromBlockNumber = 1, toBlockNumber = undefined) => {
                    const contract = getEventContract(provider, contractAddress, contractFunctions);
                    const eventFilter = contract.filters[eventFunctionName]();
                    const events = await contract.queryFilter(eventFilter, fromBlockNumber, toBlockNumber);
                    let latestsEvents = [];
                    
                    for (let event of events) {
                        latestsEvents.push(event);
                    }
                    return latestsEvents;
                }
    
                const doEventTracking = async (key, networkName, contractAddress, contractFunctions, eventFunctionName, eventFormatterFn, callbackNewEventFn) => {
                    const provider = getNetworkProvider(networkName);
                    if (!app.evmEventManager.db.exists(key, 'blockNumber')) {
                        app.evmEventManager.db.save(key, { hash: 'blockNumber', value: defaultStartBlockNumber });
                    }
                    const lastBlockNumberWhereWeAre = app.evmEventManager.db.get(key, 'blockNumber').value;
                    const lastBlockNumber = await provider.getBlockNumber();
                    const numberOfBlockPerBatch = 1000;

                    for (let i = lastBlockNumberWhereWeAre; i < lastBlockNumber; i += numberOfBlockPerBatch) {
                        const targetBlockNumber = i + numberOfBlockPerBatch > lastBlockNumber ? lastBlockNumber : i + numberOfBlockPerBatch; 
                        const newEvents = await getEventsFromBlockNumber(provider, contractAddress, contractFunctions, eventFunctionName, i, targetBlockNumber);
                        app.evmEventManager.db.save(key, { hash: 'blockNumber', value: targetBlockNumber });

                        console.log(`[${((new Date()).toISOString())}] - [${key}] - [b${i} to b${targetBlockNumber}] - ${newEvents.length} events detected`);
                        for (let event of newEvents) {
                            try {
                                const formattedEvent = await eventFormatterFn(event, provider);
                                // if (!app.evmEventManager.db.exists(key, formattedEvent.hash)) {
                                await callbackNewEventFn(formattedEvent);
                                // }
                            } catch (e) {
                                console.log(e);
                            }
                        }
                    }
                }
                let inProgress = false;
                const fnDo = async () => {
                    try {
                        if (inProgress) {
                            console.log(`[${((new Date()).toISOString())}] - [${key}] - doEventTracking - BUSY`);
                            return ;
                        }
                        inProgress = true;
                        console.log(`[${((new Date()).toISOString())}] - [${key}] - doEventTracking - START`);
                        await doEventTracking(key, networkName, contractAddress, contractFunctions, eventFunctionName, eventFormatterFn, callbackNewEventFn);
                        console.log(`[${((new Date()).toISOString())}] - [${key}] - doEventTracking - FINISHED`);
                        inProgress = false;
                    } catch (e) {
                        inProgress = false;
                        console.log(e);
                    }
                };
                setInterval(fnDo, 60000); // one time per minute
                await fnDo();
    
                // let eventFilter = contract.filters[eventFunctionName]();
                // contract.on(eventFilter, async () => {
                //     const lastBlockNumber = await provider.getBlockNumber();
                //     cb(await getBridgeEventsFromBlockNumber(lastBlockNumber - 100));
                // });
            }, 100);
        }
    };
};