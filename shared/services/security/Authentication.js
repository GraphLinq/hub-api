'use strict';

const jwt = require('jsonwebtoken');
const { match } = require('../../patternMatching');

const secret = "secretToken";

/**
 * Sign token with expiration of 24 days
 */
exports.GetToken = function(obj) {
    return jwt.sign(obj, secret, {
        expiresIn: 86400 // expires in 24 hours
    });
};

/**
 * Check if headers have a token authorization, verify token,
 * set decoded value on req._token
 */
exports.AuthenticatedFilter = function(req, res, next) {
    var token = req.headers['authorization'];

    if (!token) return res.status(401).send({ auth: false, message: 'No token provided.' });

    jwt.verify(token, secret, function(err, decoded) {
        if (err) return res.status(500).send({ auth: false, message: 'Failed to authenticate token.' });
        else req._token = decoded;
        next();
    });
};

/**
 * Get headers map and get key authorization 
 * Return decoded jwt
 */
exports.DecodeToken = function(headers) {
    var token = headers['authorization'];

    return jwt.decode(token);
};