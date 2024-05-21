'use strict';
const { AddRoute, Validation, ValidationStep } = require('../../shared/services/security/Filter');
const fs = require('fs');
const moment = require('moment');
const { getChallengesAccount, saveChallengesAccount, getAllChallengesAccounts } = require('../../challengesAccounts');
const { getAllChallenges } = require('../../challenges');

const cache = {
    time: 0,
    data: undefined
};

const reantrancy = {
};

const ChallengesResourceController = {
    /**
     * /challenges/0xxxxx
     * EXPOSED ROUTE
     */
    challenges: (app, type, route) => AddRoute(app, type, route,
        //////////////////////////////////////////////////////////
        // Validation ->
        //////////////////////////////////////////////////////////
        [],
        //////////////////////////////////////////////////////////
        // Entry point ->
        //////////////////////////////////////////////////////////
        async (req, res) => {
            const address = req?.params?.address;
            if (address === undefined || !/(0x[a-f0-9A-F]{40})$/g.test(address)) {
                res.send([]);
                return ;
            }
            const account = getChallengesAccount(address);
            const challenges = getAllChallenges();
            const resultOfChallenges = challenges.reduce((acc, chall) => {
                acc.push({ ... chall, progression: chall.progression(account), status: chall.status(account) });
                return acc;
            }, []);
            const pointsCompleted = resultOfChallenges.filter(x => x.status === 'COMPLETED').reduce((acc, x) => {
                acc += x.reward;
                return acc;
            }, 0);

            res.send({
                points: pointsCompleted,
                challenges: resultOfChallenges
            });
        }),

    /**
     * /ladder?page=1&size=10
     * EXPOSED ROUTE
     */
    ladder: (app, type, route) => AddRoute(app, type, route,
        //////////////////////////////////////////////////////////
        // Validation ->
        //////////////////////////////////////////////////////////
        [],
        //////////////////////////////////////////////////////////
        // Entry point ->
        //////////////////////////////////////////////////////////
        async (req, res) => {
            const page = req.query['page'] ? Number(req.query['page']) : 1;
            const size = req.query['size'] ? Number(req.query['size']) : 10;

            if (page < 0 || isNaN(page) || size < 1 || isNaN(size) || size > 100) {
                res.send([]);
                return ;
            }

            const allChallengesAccountsObj = getAllChallengesAccounts();
            const allChallengesAccounts = Object.values(allChallengesAccountsObj);
            const challenges = getAllChallenges();

            const accountsWithPoints = allChallengesAccounts.map(account => {
                const totalPoints = challenges.reduce((acc, chall) => {
                    if (chall.status(account) === 'COMPLETED') {
                        acc += chall.reward;
                    }
                    return acc;
                }, 0);
                return { address: account.address, points: totalPoints };
            }).sort((a, b) => b.points - a.points);

            let i = (page * size) - size;
            const ladderPartition = [];
            if (accountsWithPoints.length > i) {
                for (;i < (page * size); i++) {
                    if (accountsWithPoints[i] === undefined) {
                        break ;
                    }
                    ladderPartition.push({
                        ... accountsWithPoints[i],
                        position: (i + 1)
                    });
                }
            }
            res.send(ladderPartition);
        })
};

module.exports = ChallengesResourceController;
