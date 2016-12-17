// Dependencies
//const modules = require('./lib/modules');
//const instances = require('./lib/instances');
//const events = require('./lib/events');
const cayley = require('./lib/cayley');
const sequence = require('./lib/sequence');
const utils = require('./lib/utils');

// export API methods
module.exports = {
    connect: cayley.connect,
    get: {
        flow: sequence.flow,
        networks: sequence.networks,
        entrypoints: sequence.entrypoints,
        entrypoint: sequence.entrypoint,
        sequence: sequence.sequence,
        handler: sequence.handler
    },
    set: {},
    del: {},
    utils: utils
    /*vis: {
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
    },*/
};
