'use strict';

const orm = require("orm");

const PrinterQueue = require("./models/PrinterQueue");

module.exports = function(opts) {
    return function(app) {

        orm.settings.set("connection.reconnect", true);

        function load() {
            orm.connect(opts, function (err, db) {
                if (err) {
                    console.error(err);
                    console.error('Wait 5 secondes ...');
                    setTimeout(load, 5000);
                    return ;
                }
                app.models = {
                    printerQueue: PrinterQueue(orm, db)
                };
                Object.keys(app.models).map(x => app.models[x]).forEach((model) => {
                    model.syncPromise((x) => {
                        if (x) console.error(x);
                    })
                });
                app.fire.call["ON_INIT_DATABASE"](app.models);
            });
        };

        function mergeRefObjIntoObjWithoutConflict(defaultRefObject, obj) {
            Object.keys(defaultRefObject).forEach(x => { if (obj[x] == undefined) obj[x] = defaultRefObject[x]; });
            return obj;
        }

        /** APP.DB INTERFACE */
        app.db = {
            /** FUNCTIONS : */
            functionsMap: {},
            addFunction: function(key, f) {
                app.db.functionsMap[key] = f;
            },
            _callFunction: function(key, arg0) {
                if (app.db.functionsMap[key] == undefined) return;
                app.db.functionsMap[key](arg0);
            },
            /** CREATE : */
            create: function(parameters = {}) {
                app.db._create(mergeRefObjIntoObjWithoutConflict({
                    model: undefined,
                    obj: undefined,
                    functions: [],
                    transform: (obj) => { return obj; },
                    callback: [() => {/** success */}, () => {/** failure */}],
                }, parameters));
            },
            _create: /** private */ function(parameters = {}) {
                if (parameters.functions) parameters.functions.forEach(x => app.db._callFunction(x, parameters.obj));
                parameters.model.create(parameters.obj, (err, obj) => {
                    if (obj === undefined) {
                        parameters.callback[1](err);
                    } else {
                        parameters.callback[0](parameters.transform(obj));
                    }
                });
            },
            /** FIND   : */
            findOne: function(parameters = {}) {
                app.db._find(mergeRefObjIntoObjWithoutConflict({
                    model: undefined,
                    size: 1,
                    page: 1,
                    acceptCondition: (objs) => { return objs.length == 1; },
                    transform: (objs) => { return objs[0]; },
                    callback: [() => {/** success */}, () => {/** failure */}],
                    one: true
                }, parameters));
            },
            findAll: function(parameters = {}) {
                app.db._find(mergeRefObjIntoObjWithoutConflict({
                    model:           undefined,
                    size:            100,
                    page:            1,
                    query:           {},
                    acceptCondition: (_ /** Array<T> */) => { return true; },
                    transform:       (objs /** Array<T> */) => { return objs; },
                    callback:        [() => {/** success */}, () => {/** failure */}],
                    one: false
                }, parameters));
            },
            _find: /** private */ function(parameters) {
                parameters.model.find(parameters.query)
                    .limit(parameters.size)
                    .offset(parameters.size * (parameters.page - 1))
                    .run((err, objs) => {
                        if (objs && parameters.acceptCondition(objs)) {
                            parameters.callback[0](parameters.transform(parameters.one ? objs[0] : objs));
                        } else {
                            parameters.callback[1](err);
                        }
                    });
            },
            /** DB OBJECT */
            Object: {
                remove: function(parameters = {}) {
                    parameters.obj.remove((err) => !err ? parameters.callback[0](parameters.obj) : parameters.callback[1](err));
                },
                save: function(parameters = {}) {
                    parameters.obj.save((err) => !err ? parameters.result ? parameters.callback[0](parameters.result[0], parameters.result[1]) : parameters.callback[0](parameters.obj) : parameters.callback[1](err));
                },
                /** call: callback[0](lastObj, obj), on error call: callback[1](err) */
                update: function(parameters = {}) {
                    const lastObj = JSON.parse(JSON.stringify(parameters.obj));

                    Object.keys(parameters.change)
                        .filter(x => parameters.change[x] !== undefined && parameters.change[x] != parameters.obj[x])
                        .forEach(x => { parameters.obj[x] = parameters.change[x]; });
                    app.Object.save({
                        obj: parameters.obj,
                        result: [parameters.obj, lastObj],
                        callback: parameters.callback
                    });
                }
            }
        };
        load();
    };
};