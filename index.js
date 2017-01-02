// Dependencies
//const modules = require('./lib/modules');
//const instances = require('./lib/instances');
//const events = require('./lib/events');
const cayley = require('cayley');
const Adapter = require('./lib/cayley_adapter');
const VIS = require('./lib/cayley_vis');
const GET = require('./lib/cayley_get');
const PUT = require('./lib/cayley_put');
const utils = require('./lib/utils');

function connect (state, db) {
    state.client = cayley(db);
    state.g = state.client.graph;
}

function getHandler (Methods, fn, params) {

    if (typeof Methods[fn] !== 'function') {
        throw new Error('Flow-api.cayley: Method "' + fn + '" doesn\' exists.');
    }

    return (scope, state, args, data, next) => { 

        // create db client for state
        if (!state.client) {
            connect(state, scope.env.db);
        }

        let query_args = [state.g];
        for (let i = 0, l = params.length; i < l; ++i) {

            if (typeof data[params[i]] === 'undefined') {
                return next(new Error('Flow-api.get.' + fn  + ': Missing parameter "' + params[i]  + '".'));
            }

            query_args.push(data[params[i]]);
        };

        query_args.push(!data.session || !data.session.role ? scope.env.role : data.session.role);

        data.readable = Methods[fn].apply(null, query_args);

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

function putHandler (scope, state, args, data, next) {

    // create db client for state
    if (!state.client) {
        connect(state, scope.env.db);
    }

    data.req.on('data', triple => PUT.put(state.client, triple));
    data.body = {status: "ok"};
    next(null, data);
}

// export API methods
module.exports = {
    _connect: connect,
    utils: utils,
    flow: getHandler(Adapter, 'flow', ['id']),
    vis: {
        networks: getHandler(VIS, 'vis_networks', ['id']),
        entrypoints: getHandler(VIS, 'vis_entrypoints', ['id']),
        entrypoint: getHandler(VIS, 'vis_entrypoint', ['id']),
        sequence: getHandler(VIS, 'vis_sequence', ['id']),
        handler: getHandler(VIS, 'vis_handler', ['id'])
    },
    get: getHandler(GET, 'get', ['id', 'type']),
    put: putHandler,
    del: {}
};
