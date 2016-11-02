'use strict';

// Dependencies
const adapter = require('./lib/adapter');
const modules = require('./lib/modules');
const events= require('./lib/events');

// export API methods
module.exports = {
    vis: {
        modules: modules.modules,
        instances: modules.instances,
        instance: modules.instance,
        event: events.event,
        handler: events.handler
    },
    adapter: adapter
};


/**
 * Main init function
 *
 * @private
*/
module.exports.init = (config, ready) => {
    ready();
};


