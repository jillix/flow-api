// Dependencies
//const modules = require('./lib/modules');
//const instances = require('./lib/instances');
//const events = require('./lib/events');
const cayley = require('./lib/cayley');
const utils = require('./lib/utils');

// export API methods
module.exports = {
    connect: cayley.connect,
    get: {
        flow: (scope, state, args, data, next) => {

            if (!data.id) {
                return next(new Error('Flow-api.get.flow: missing sequence id.'));
            }

            let role = !data.session || !data.session.role ? scope.env.role : data.session.role;

            data.readable = cayley.flow(state.g, data.id, role);
            data.readable[0].pause();
            data.readable[1].pause();
            data.readable[2].pause();
            data.resume = data.readable;
            next(null, data);
        }
        //entrypoints: sequence.entrypoints,
        //sequence: sequence.detail,
        //handler: sequence.handler,
        //method: method
    },
    set: {},
    del: {},
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
    utils: utils
};
