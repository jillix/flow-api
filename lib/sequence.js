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

exports.entrypoints = (scope, state, args, data, next) => {

    if (!data.id) {
        return next(new Error('Flow-api.get.flow: missing sequence id.'));
    }

    let role = !data.session || !data.session.role ? scope.env.role : data.session.role;

    data.readable = cayley.entrypoints(state.g, data.id, role);
    data.readable.pause();
    data.resume = data.readable;
    next(null, data);
};
