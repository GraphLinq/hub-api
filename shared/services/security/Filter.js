'use strict';

const { check, cookie, header, param, body, query, buildCheckFunction } = require('express-validator/check');

const addRouteAndValidation = function(app, key, route, validationFilters = [], callback = () => {}) {
    app.route(route)[key](validationFilters, (req, res) => {
        if (!validationStep(req, res, () => {})) {
            return ;
        }
        callback(req, res);
    });
};

const validationStep = function(req, res, next) {
    const errors = req._validationErrors;
    if (errors != undefined && errors.length) {
        var obj = {};
        var array = errors.map((x) => Object.assign({}, { param: x.param }, x.msg));

        array.map((x) => {
            if (obj[x.code] != undefined) {
                obj[x.code].param += ':' + x.param;
            } else {
                obj[x.code] = x;
            }
        });
        res.status(406).json({ errors: Object.values(obj) });
        return false;
    }
    next();
    return true;
};

/**
 * Validation Function
 */
const validation = function(id, arrays) {
    var type = id.split(':')[0]
    var fieldName = id.split(':')[1]
    var getField = function(type, fieldName) {
        switch (type) {
            case 'body':    return body(fieldName);
            case 'param':   return param(fieldName);
            case 'query':   return query(fieldName);
            case 'check':   return check(fieldName);
            case 'cookie':  return cookie(fieldName);
            case 'header':  return header(fieldName);
            default:        return param(fieldName);
        }
    }
    var field = buildCheckFunction(type.split(',').map(x => x.replace('param', 'params')))(fieldName);

    for (var array of arrays) {
        var key = array[0];
        var args = array.length === 3 ? array[1] : undefined;
        var message = array.length === 3 ? array[2] : array.length === 2 ? array[1] : undefined;

        field = field[key](args);
        if (message != undefined) {
            field = field.withMessage(message)
        }
    }
    return field;
};

/**
 * Function for adding a new route with filters and callback to Controller
 */
exports.AddRoute = (app, type, route, validationFilters, callback) =>
    addRouteAndValidation(app, type.toLowerCase(), route, validationFilters, callback);

/**
 * Function check if validation have errors 
 * Return code 406 with { errors: {} } if req._validationErrors is not empty.
 */
exports.ValidationStep = (req, res, next) =>
    validationStep(req, res, next);

/**
 * Validation Function
 * 
 * id => `type`:`fieldName` example : query:id
 * arrays => 
 * 
 */
exports.Validation = (id, arrays) =>
    validation(id, arrays);

exports.CustomValidation = (callback = (req, res, next) => { next(); }) => callback;