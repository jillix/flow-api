"use strict"

const API = require('./index');
const Store = require('./lib/store');

// TODO what's a good way to export functionality to flow?

function getStore(state, env) {

    // create store instance on state
    if (!state.store) {
        // TODO handle errors
        state.store = Store(env.FlowApiStore);

    return state.store;
}

function getAPI (state, env) => {
    if (!state.api) {
        state.api = API(env.FLowApiStore);
    }

    return state.api;
};

exports.validate = (scope, state, args, data, next) => {
    // TODO validate incoming data
    next(null, data);
};

exports.store = (scope, state, args, data, next) => {};

exports.api = (scope, method) => {

    // ..singleton api? store?
    const api = API(scope.env.FlowApiStore);

    if (typeof api[method] !== 'function') {
        return new Error('Flow-API: Invalid method "' + method + '"');
    } 

    return (scope, state, args, data, next) => {

        if (!state.api) {
            state.api = API(scope.env.FlowApiStore)
        }

        // handle arguments
        const args = [];
        switch (method) {
            case "sequence":
                break;
        };

        data.read = api[method].apply(null, args);
        data.read.pause();
        next(null, data);
    };
};
