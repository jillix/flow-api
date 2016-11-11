'use strict';

// Dependencies
const adapter = require('./lib/adapter');
const modules = require('./lib/modules');
const events = require('./lib/events');
const cayley = require('./lib/cayley');

// export API methods
module.exports = {
    connect: cayley.connect,
    vis: {
        modules: modules.modules,
        instances: modules.instances,
        instance: modules.instance,
        event: events.event,
        handler: events.handler
    },
    adapter: adapter
};
