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
console.log('Flow-API._networks:', data.id);
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

exports.seq = (scope, state, args, data, next) => { 
console.log('Flow-API.seq:', data.id);
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

exports.outNodes = (scope, state, args, data, next) => { 
console.log('Flow-API.out:', data.id);
    // export validation and implement it with flow
    const err = validate('out', data.id);
    if (err) {
        return next(err);
    }

    data.readable = getStore(state, scope.env).outNodes(data.id);
    data.readable.pause();
    data.resume = data.readable;

    next(null, data);
};

exports.obj = (scope, state, args, data, next) => { 
console.log('Flow-API.obj:', data.id);
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
console.log('Flow-API.seq:', data.id);
    // create store instance on state
    if (!state.store) {
        state.store = Store(scope.env.FlowApiStore);
    }

    //data.readable = getStore(state, scope.env);
    //data.readable.pause();
    //data.resume = data.readable;
    next(null, data);
};

exports.set = (scope, state, args, data, next) => {
console.log('Flow-API.set:', data.id);
    // create store instance on state
    if (!state.store) {
        state.store = Store(scope.env.FlowApiStore);
    }

    //data.readable = req.pipe(POST(state.store));
    //data.readable.pause();
    //data.resume = data.readable;
    next(null, data);
};

exports.rmn = (scope, state, args, data, next) => {
console.log('Flow-API.rmn:', data.id);
    // create store instance on state
    if (!state.store) {
        state.store = Store(scope.env.FlowApiStore);
    }

    //data.readable = getStore(state, scope.env);
    //data.readable.pause();
    //data.resume = data.readable;
    next(null, data);
};

exports.rme = (scope, state, args, data, next) => {
console.log('Flow-API.rme:', data.id);
    // create store instance on state
    if (!state.store) {
        state.store = Store(scope.env.FlowApiStore);
    }

    //data.readable = getStore(state, scope.env);
    //data.readable.pause();
    //data.resume = data.readable;
    next(null, data);
};
