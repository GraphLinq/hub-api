'use strict';
const { AddRoute, Validation, ValidationStep } = require('../../shared/services/security/Filter');
const fs = require('fs');
const moment = require('moment');
const { getChallengesAccount } = require('../../challengesAccounts');
const { getAllChallenges } = require('../../challenges');

const cache = {
    time: 0,
    data: undefined
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
        })
};

module.exports = ChallengesResourceController;
