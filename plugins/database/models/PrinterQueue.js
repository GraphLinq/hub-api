'use strict';

module.exports = function(app, db) {
    return db.define("printer", {
        id            : { type: 'integer', size: 8, defaultValue: 0, key: true },
        order_id      : { type: 'integer', size: 8 },
        url           : { type: 'text', big: true },
        state         : { type: 'integer', size: 4 },
        probe         : { type: 'text', big: true }
    }, {
        hooks: {},
        methods: {},
        validations: {}
    });
};