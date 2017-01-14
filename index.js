"use strict"

const FLOW = require('./lib/request_flow');
const VIS = require('./lib/request_vis');
const GET = require('./lib/request_get');
const POST = require('./lib/request_post');
const DELETE = require('./lib/request_delete');
const Store = require('./lib/store');
const utils = require('./lib/utils');

function getHandler (Methods, fn, params) {

    if (typeof Methods[fn] !== 'function') {
        throw new Error('Flow-api.cayley: Method "' + fn + '" doesn\' exists.');
    }

    return (scope, state, args, data, next) => { 

        // create store instance on state
        if (!state.store) {
            // TODO handle errors
            state.store = Store(scope.env.FlowApiStore);
        }

        let query_args = [state.store];
        for (let i = 0, l = params.length; i < l; ++i) {

            if (typeof data[params[i]] === 'undefined') {
                return next(new Error('Flow-api.get.' + fn  + ': Missing parameter "' + params[i]  + '".'));
            }

            query_args.push(data[params[i]]);
        };

        query_args.push(!data.session || !data.session.role ? scope.env.role : data.session.role);

        data.readable = Methods[fn].apply(null, query_args);
        data.readable.pause();
        data.resume = data.readable;

        next(null, data);
    }
} 

function postHandler (METHOD) {
    return (scope, state, args, data, next) => {

        // create store instance on state
        if (!state.store) {
            state.store = Store(scope.env.FlowApiStore);
        }

        data.readable = req.pipe(METHOD(state.store));
        next(null, data);
    };
}

// export API methods
module.exports = {
    utils: utils,
    flow: getHandler(FLOW, 'flow', ['id']),
    vis: {
        networks: getHandler(VIS, 'networks', ['id']),
        entrypoints: getHandler(VIS, 'outNodeNames', ['id']),
        entrypoint: getHandler(VIS, 'outNodeNames', ['id']),
        sequence: getHandler(VIS, 'outNodeNames', ['id']),
        handler: getHandler(VIS, 'handler', ['id']),
        object: getHandler(VIS, 'getObject', ['id'])
    },
    get: getHandler(GET, 'get', ['id', 'type']),
    save: postHandler(POST),
    remove: postHandler(DELETE)
};
