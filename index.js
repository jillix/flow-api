"use strict"

const POST = require('./lib/request_post');
const DELETE = require('./lib/request_delete');
const Store = require('./lib/store');

// TODO integrity and access
function validate () {}

function getStore(state, env) {

    // create store instance on state
    if (!state.store) {
        // TODO handle errors
        state.store = Store(env.FlowApiStore);
    }

    return state.store;
}

exports._networks = (scope, state, args, data, next) => { 

    // export validation and implement it with flow
    const err = validate('networks', data.id);
    if (err) {
        return next(err);
    }

    data.readable = getStore(state, scope.env).networks(data.id);
    data.readable.pause();
    data.resume = data.readable;

    next(null, data);
};

exports._handler = (scope, state, args, data, next) => { 

    // export validation and implement it with flow
    const err = validate('handler', data.id);
    if (err) {
        return next(err);
    }

    data.readable = getStore(state, scope.env).outNodeNamesFn(data.id);
    data.readable.pause();
    data.resume = data.readable;

    next(null, data);
};

exports.seq = (scope, state, args, data, next) => { 

    const role = !data.session || !data.session.role ? scope.env.role : data.session.role;

    // export validation and implement it with flow
    const err = validate('sequence', data.id, role);
    if (err) {
        return next(err);
    }

    data.readable = getStore(state, scope.env).sequence(data.id, role);
    data.readable.pause();
    data.resume = data.readable;

    next(null, data);
};

exports.out = (scope, state, args, data, next) => { 

    // export validation and implement it with flow
    const err = validate('out', data.id);
    if (err) {
        return next(err);
    }

    data.readable = getStore(state, scope.env).outNodeNames(data.id);
    data.readable.pause();
    data.resume = data.readable;

    next(null, data);
};

exports.obj = (scope, state, args, data, next) => { 

    // export validation and implement it with flow
    const err = validate('object', data.id);
    if (err) {
        return next(err);
    }

    data.readable = getStore(state, scope.env).getObject(data.id);
    data.readable.pause();
    data.resume = data.readable;

    next(null, data);
};

exports.add = (scope, state, args, data, next) => {

    // create store instance on state
    if (!state.store) {
        state.store = Store(scope.env.FlowApiStore);
    }

    //data.readable = req.pipe(POST(state.store));
    next(null, data);
};

exports.set = (scope, state, args, data, next) => {

    // create store instance on state
    if (!state.store) {
        state.store = Store(scope.env.FlowApiStore);
    }

    //data.readable = req.pipe(POST(state.store));
    next(null, data);
};

exports.rmn = (scope, state, args, data, next) => {

    // create store instance on state
    if (!state.store) {
        state.store = Store(scope.env.FlowApiStore);
    }

    //data.readable = req.pipe(DELETE(state.store));
    next(null, data);
};

exports.rme = (scope, state, args, data, next) => {

    // create store instance on state
    if (!state.store) {
        state.store = Store(scope.env.FlowApiStore);
    }

    //data.readable = req.pipe(DELETE(state.store));
    next(null, data);
};
