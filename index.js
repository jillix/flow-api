// Dependencies
//const modules = require('./lib/modules');
//const instances = require('./lib/instances');
//const events = require('./lib/events');
const cayley = require('./lib/cayley');
const utils = require('./lib/utils');

function getHandler (method, params) {

    if (typeof cayley[method] !== 'function') {
        throw new Error('Flow-api.cayley: Method "' + method + '" doesn\' exists.');
    }

    return (scope, state, args, data, next) => { 

        let query_args = [state.g];
        for (let i = 0, l = params.length; i < l; ++i) {

            if (typeof data[params[i]] === 'undefined') {
                return next(new Error('Flow-api.get.' + method  + ': Missing parameter "' + params[i]  + '".'));
            }

            query_args.push(data[params[i]]);
        };

        query_args.push(!data.session || !data.session.role ? scope.env.role : data.session.role);

        data.readable = cayley[method].apply(null, query_args);

        try {
            if (data.readable instanceof Array) {
                data.readable.forEach(stream => stream.pause());
            } else {
                data.readable.pause();
            }
        } catch (err) {
            return next(err);
        }

        data.resume = data.readable;
        next(null, data);
    }
} 

// export API methods
module.exports = {
    connect: cayley.connect,
    utils: utils,
    flow: getHandler('flow', ['id']),
    vis: {
        networks: getHandler('vis_networks', ['id']),
        entrypoints: getHandler('vis_entrypoints', ['id']),
        entrypoint: getHandler('vis_entrypoint', ['id']),
        sequence: getHandler('vis_sequence', ['id']),
        handler: getHandler('vis_handler', ['id'])
    },
    get: getHandler('get', ['id', 'type']),
    set: {},
    del: {}
};
