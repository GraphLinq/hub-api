'use strict';
const { AddRoute, Validation, ValidationStep } = require('../../shared/services/security/Filter');
const fs = require('fs');
const moment = require('moment');
const { getChallengesAccount, saveChallengesAccount } = require('../../challengesAccounts');
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
            if (address === undefined) {
                res.send([]);
                return ;
            }
            const account = getChallengesAccount(address);
            const challenges = getAllChallenges();
            const resultOfChallenges = challenges.reduce((acc, chall) => {
                acc.push({ ... chall, status: chall.status(account) });
                return acc;
            }, []);

            res.send(resultOfChallenges);
        }),
    /**
     * /claim/0xxxxx
     * EXPOSED ROUTE
     */
    claim: (app, type, route) => AddRoute(app, type, route,
        //////////////////////////////////////////////////////////
        // Validation ->
        //////////////////////////////////////////////////////////
        [],
        //////////////////////////////////////////////////////////
        // Entry point ->
        //////////////////////////////////////////////////////////
        async (req, res) => {
            const address = req?.params?.address;
            if (address === undefined) {
                res.send([]);
                return ;
            }
            if (reantrancy[address] === true) {
                res.send({ valid: false });
                return ;
            }
            reantrancy[address] = true;
            const account = getChallengesAccount(address);
            const challenges = getAllChallenges();
            const claimableChallenges = challenges.map(chall => ({ chall: chall, status: chall.status(account) })).filter(x => x.status === 'CLAIMABLE');
            const pointsClaimables = claimableChallenges.reduce((acc, x) => {
                acc += x.chall.reward;
                return acc;
            }, 0);
            const challengesIds = claimableChallenges.map(x => x.chall.id);
            account.claims.push(... challengesIds);
            saveChallengesAccount(account);
            //todo send pointsClaimables
            console.log(pointsClaimables);
            delete reantrancy[address];
            res.send({ valid: true });
        })
};

module.exports = ChallengesResourceController;
