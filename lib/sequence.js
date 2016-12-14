"use strict"

const cayley = require('./cayley');

exports.flow = (scope, state, args, data, next) => {

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
};

exports.networks = (scope, state, args, data, next) => {

    if (!data.id) {
        return next(new Error('Flow-api.get.flow: Missing user info.'));
    }

    let role = !data.session || !data.session.role ? scope.env.role : data.session.role;

    data.readable = cayley.networks(state.g, data.id, role);
    data.readable.pause();
    data.resume = data.readable;
    next(null, data);
};

exports.entrypoints = (scope, state, args, data, next) => {

    if (!data.id) {
        return next(new Error('Flow-api.get.flow: Missing network id.'));
    }

    let role = !data.session || !data.session.role ? scope.env.role : data.session.role;

    data.readable = cayley.entrypoints(state.g, data.id, role);
    data.readable[0].pause();
    data.readable[1].pause();
    data.resume = data.readable;
    next(null, data);
};

exports.entrypoint = (scope, state, args, data, next) => {

    if (!data.id) {
        return next(new Error('Flow-api.get.flow: Missing entrypoint id.'));
    }

    let role = !data.session || !data.session.role ? scope.env.role : data.session.role;

    data.readable = cayley.entrypoint(state.g, data.id, role);
    data.readable[0].pause();
    data.readable[1].pause();
    data.readable[2].pause();
    data.readable[3].pause();
    data.resume = data.readable;
    next(null, data);
};

exports.sequence = (scope, state, args, data, next) => {

    if (!data.id) {
        return next(new Error('Flow-api.get.flow: Missing sequence id.'));
    }

    let role = !data.session || !data.session.role ? scope.env.role : data.session.role;

    data.readable = cayley.sequence(state.g, data.id, role);
    data.readable[0].pause();
    data.readable[1].pause();
    data.readable[2].pause();
    data.resume = data.readable;
    next(null, data);
};

exports.handler = (scope, state, args, data, next) => {

    if (!data.id) {
        return next(new Error('Flow-api.get.flow: Missing handler id.'));
    }

    let role = !data.session || !data.session.role ? scope.env.role : data.session.role;

    data.readable = cayley.handler(state.g, data.id, role);
    data.readable.pause();
    data.resume = data.readable;
    next(null, data);
};
