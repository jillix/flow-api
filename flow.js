"use strict"

const API = require('./index');
const Store = require('./lib/store');

function callSync (method, args, err, std) {

    const result = method.apply(null, args);
    if (result instanceof Error) {
        return err(result);
    }

    std(result);
}

function handleResult (data, next) {
    return (result) => {
        result.pause();
        data.read = result;
        data.resume = result;
        next(null, data);
    };
}

exports.store = (scope, state, args, data, next) => {

    if (!state.store) {
        callSync(Store, [args.store || scope.env.FlowApiStore], next, (store) => {
            state.store = store;
            next(null, data)
        });
    } else {
        next(null, data);
    }
};

exports._networks = (scope, state, args, data, next) => {
    callSync(API._networks, [
        state.store,
        data.user
    ], next, handleResult(data, next));
};

exports.sequence = (scope, state, args, data, next) => {
    callSync(API.sequence, [
        state.store,
        data.node,
        data.role
    ], next, handleResult(data, next));
};
exports.getOutNodes = (scope, state, args, data, next) => {
    callSync(API.getOutNodes, [
        state.store,
        data.from,
        data.out
    ], next, handleResult(data, next));
};

exports.getNodeData = (scope, state, args, data, next) => {
    callSync(API.getNodeData, [
        state.store,
        data.node
    ], next, handleResult(data, next));
};

exports.getNodeName = (scope, state, args, data, next) => {
    callSync(API.getNodeName, [
        state.store,
        data.node
    ], next, handleResult(data, next));
};

exports.setNodeData = (scope, state, args, data, next) => {
    callSync(API.setNodeData, [
        state.store,
        data.node,
        data.data
    ], next, handleResult(data, next));
};

exports.setNodeName = (scope, state, args, data, next) => {
    callSync(API.setNodeName, [
        state.store,
        data.node,
        data.name
    ], next, handleResult(data, next));
};

exports.addOutNode = (scope, state, args, data, next) => {
    console.log(data.add, data.out, data.node);
    callSync(API.addOutNode, [
        state.store,
        data.add,
        data.out,
        data.node
    ], next, handleResult(data, next));
};

exports.addOutCreate = (scope, state, args, data, next) => {
    callSync(API.addOutCreate, [
        state.store,
        data.add,
        data.out,
        data.node
    ], next, handleResult(data, next));
};

exports.setOutNode = (scope, state, args, data, next) => {
    callSync(API.setOutNode, [
        state.store,
        data.set,
        data.out,
        data.node
    ], next, handleResult(data, next));
};

exports.setOutCreate = (scope, state, args, data, next) => {
    callSync(API.setOutCreate, [
        state.store,
        data.set,
        data.out,
        data.node
    ], next, handleResult(data, next));
};

exports.removeNode = (scope, state, args, data, next) => {
    callSync(API.removeNode, [
        state.store,
        data.node
    ], next, handleResult(data, next));
};

exports.removeOut = (scope, state, args, data, next) => {
    callSync(API.removeOut, [
        state.store,
        data.node,
        data.out,
    ], next, handleResult(data, next));
};

exports.search = (scope, state, args, data, next) => {
    data.body = [
        ["_:9801187750764b9d6f1388ef3a060e79","<http://schema.jillix.net/vocab/Network>","Service"],
        ["_:b56c8738cfe158fe9b0b7a92777e468f", "<http://schema.jillix.net/vocab/Sequence>", "CLIENT_INIT"]
    ];
    return next(null, data);
};
