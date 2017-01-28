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
console.log('Flow-API._networks:', data.user);
    // export validation and implement it with flow
    const err = validate('networks', data.user);
    if (err) {
        return next(err);
    }

    data.readable = getStore(state, scope.env).networks(data.user);
    data.readable.pause();
    data.resume = data.readable;

    next(null, data);
};

exports.sequence = (scope, state, args, data, next) => { 
console.log('Flow-API.sequence:', data.node, data.role);

    // export validation and implement it with flow
    const err = validate('sequence', data.id, data.role);
    if (err) {
        return next(err);
    }

    data.readable = getStore(state, scope.env).sequence(data.id, data.role);
    data.readable.pause();
    data.resume = data.readable;

    next(null, data);
};

exports.getOutNodes = (scope, state, args, data, next) => { 
console.log('Flow-API.getOutNodes:', data.node, data.out);
    // export validation and implement it with flow
    const err = validate('getOutNodes', data.node);
    if (err) {
        return next(err);
    }

    data.readable = getStore(state, scope.env).outNodes(data.node, data.out);
    data.readable.pause();
    data.resume = data.readable;

    next(null, data);
};

exports.getNodeData = (scope, state, args, data, next) => { 
console.log('Flow-API.getNodeData:', data.node);
    // export validation and implement it with flow
    const err = validate('getNodeData', data.node);
    if (err) {
        return next(err);
    }

    data.readable = getStore(state, scope.env).getObject(data.node);
    data.readable.pause();
    data.resume = data.readable;

    next(null, data);
};
// TODO does a "getNodeName" method makes sense?

exports.setNodeData = (scope, state, args, data, next) => {
console.log('Flow-API.setNodeData:', data.node);
    // create store instance on state
    if (!state.store) {
        state.store = Store(scope.env.FlowApiStore);
    }

    //data.readable = getStore(state, scope.env);
    //data.readable.pause();
    //data.resume = data.readable;
    next(null, data);
};
// TODO does a "setNodeName" method makes sense?

exports.addOutNode = (scope, state, args, data, next) => {
console.log('Flow-API.addOutNode:', data.add, data.out, data.node);
    // create store instance on state
    if (!state.store) {
        state.store = Store(scope.env.FlowApiStore);
    }

    //data.readable = req.pipe(POST(state.store));
    //data.readable.pause();
    //data.resume = data.readable;
    next(null, data);
};

exports.addOutCreate = (scope, state, args, data, next) => {
console.log('Flow-API.addOutCreate:', data.add, data.out, data.create);
    // create store instance on state
    if (!state.store) {
        state.store = Store(scope.env.FlowApiStore);
    }

    //data.readable = getStore(state, scope.env);
    //data.readable.pause();
    //data.resume = data.readable;
    next(null, data);
};

exports.setOutNode = (scope, state, args, data, next) => {
console.log('Flow-API.setOutNode:', data.set, data.out, data.node);
    // create store instance on state
    if (!state.store) {
        state.store = Store(scope.env.FlowApiStore);
    }

    //data.readable = getStore(state, scope.env);
    //data.readable.pause();
    //data.resume = data.readable;
    next(null, data);
};

exports.setOutCreate = (scope, state, args, data, next) => {
console.log('Flow-API.setOutCreate:', data.set, data.out, data.create);
    // create store instance on state
    if (!state.store) {
        state.store = Store(scope.env.FlowApiStore);
    }

    //data.readable = getStore(state, scope.env);
    //data.readable.pause();
    //data.resume = data.readable;
    next(null, data);
};

exports.removeNode = (scope, state, args, data, next) => {
console.log('Flow-API.removeNode:', data.node);
    // create store instance on state
    if (!state.store) {
        state.store = Store(scope.env.FlowApiStore);
    }

    //data.readable = getStore(state, scope.env);
    //data.readable.pause();
    //data.resume = data.readable;
    next(null, data);
};

exports.removeOut = (scope, state, args, data, next) => {
console.log('Flow-API.removeOut:', data.node, data.out);
    // create store instance on state
    if (!state.store) {
        state.store = Store(scope.env.FlowApiStore);
    }

    //data.readable = getStore(state, scope.env);
    //data.readable.pause();
    //data.resume = data.readable;
    next(null, data);
};
