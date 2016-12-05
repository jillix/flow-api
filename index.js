'use strict';

// Dependencies
const adapter = require('./lib/adapter');
const modules = require('./lib/modules');
const instances = require('./lib/instances');
const events = require('./lib/events');
const cayley = require('./lib/cayley');
const utils = require('./lib/utils');

// export API methods
module.exports = {
    connect: cayley.connect,
    vis: {
        modules: {
            get: modules.get,
            details: modules.details
        },
        instances: {
            get: instances.get,
            create: instances.create,
            getOne: instances.getOne,
            details: instances.details
        },
        events: {
            getOne: events.getOne,
            create: events.create,
            details: events.details,
            handler: events.handler,
            handlerDetails: events.handlerDetails
        }
    },
    adapter: adapter,
    utils: utils
};
