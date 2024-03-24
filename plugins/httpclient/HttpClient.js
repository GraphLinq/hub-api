'use strict';

// USE CASE
// app.httpclient.patch({ url: '/social/' + social.id, body: JSON.stringify(social), headers: { Authorization: authenticationToken, "Content-Type": "application/json" }}, [
//     (json) => {
//         callback(json, undefined);
//     },
//     (err) => { callback(undefined, { err: true }); }
// ]);

module.exports = function(app) {
    /** APP.httpclient INTERFACE */
    app.httpclient = {
        get: (query, callbacks) => app.httpclient.query({
            url: null,
            headers: {},
            body: null,
            method: 'GET',
            bodyParser: 'response'
        }, query, callbacks),
        post: (query, callbacks) => app.httpclient.query({
            url: null,
            headers: {},
            body: null,
            method: 'POST',
            bodyParser: 'response'
        }, query, callbacks),
        patch: (query, callbacks) => app.httpclient.query({
            url: null,
            headers: {},
            body: null,
            method: 'PATCH',
            bodyParser: 'response'
        }, query, callbacks),
        delete: (query, callbacks) => app.httpclient.query({
            url: null,
            headers: {},
            body: null,
            method: 'delete',
            bodyParser: 'response'
        }, query, callbacks),
        put: (query, callbacks) => app.httpclient.query({
            url: null,
            headers: {},
            body: null,
            method: 'PUT',
            bodyParser: 'response'
        }, query, callbacks),
        query: (defaultQuery, query, callbacks = [() /** Sucess */ => {}, () /** Failure */ => {}]) => {
            Object.keys(defaultQuery).forEach(x => { if (query[x] == undefined) query[x] = defaultQuery[x]; });
            var xhr = new XMLHttpRequest();
            xhr.open(query.method, query.url, true);
            Object.keys(query.headers).forEach(key => xhr.setRequestHeader(key, query.headers[key]));// Headers
            xhr.onreadystatechange = app.httpclient.private_onreadystatechange[query.bodyParser](callbacks);
            xhr.send(query.body);
        },
        private_onreadystatechange: {
            response: (callbacks) => {
                return function() { // force function for insert this
                    if (this.readyState === XMLHttpRequest.DONE && this.status === 200) {
                        callbacks[0](this.response);
                    } else if (this.readyState === XMLHttpRequest.DONE) {
                        callbacks[1](this);
                    }
                };
            },
            json: (callbacks) => {
                return app.httpclient.private_onreadystatechange["response"]([(resp) => { callbacks[0](JSON.parse(resp))}, callbacks[1]]);
            }
        }
    };
};