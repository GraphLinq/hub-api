'use strict';

module.exports = function(app) {

var tableRoute = [
    [],//data
    ["Routes", "MethodType"]//fields
];
/**
 * Method for create routes 
 * @param {*} exp 
 */
const _ = function(exp) {
    var split = exp.split(' ');
    var methodType = split[0];
    var route = split[1];
    var s = split[2].split('.').filter(x => !!x);
    var func = s[s.length - 1].split('(')[0];
    var classe = '.' + s[0];
    var resourceController = require(classe);

    tableRoute[0].push({ Routes: route, MethodType: methodType });
    resourceController[func](app, methodType, route);
};

/** START ROUTE DECLARATION ZONE */

/**
 * @swagger
 * /stats:
 *   get:
 *     summary: Hub Stats
 *     tags:
 *       - name: Hub
 *     responses:
 *       200:
 *         description: Sucess
 *       404:
 *         description: Authentication failed
 *       500:
 *         description: Server Error
 */
_("GET /stats ./exposition/controllers/PriceResourceController.stats()");

/** END ROUTE DECLARATION ZONE */

tableRoute[0] = tableRoute[0].sort((a, b) => a.Routes > b.Routes ? 1 : -1);
    console.table(tableRoute[0], tableRoute[1]);
};
