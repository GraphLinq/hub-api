'use strict';

module.exports = function(app) {
    app.fire = {
        call: {},
        create: (eventName, eventHandler) => {
            app.fire.call[eventName] = eventHandler;
        }
    };
};