"use strict"

// Dependencies
const cayley = require('./cayley');

// RDF constants
const RDF_TYPE = 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type';
const FLOW_VOCAB = 'http://schema.jillix.net/vocab/';
const SCHEMA = 'http://schema.org/';

/**
 * Returns an event and all its sequences
 * @name event
 *
*/
exports.event = (scope, inst, args, data, next) => {

    if (!data.id) {
        return next(new Error('Flow-api.event.event: missing handler id.'));   
    }

    data.readable = cayley.event(inst.g, data.id);
    data.readable[0].pause();
    data.readable[1].pause();
    data.resume = data.readable;
    next(null, data);
};

/**
 * Returns a handler and its data
 * @name handler
 *
*/
exports.handler = (scope, inst, args, data, next) => {

    if (!data.id) {
        return next(new Error('Flow-api.event.handler: missing handler id.'));   
    }

    data.readable = cayley.handler(inst.g, data.id);
    data.readable.pause();
    data.resume = data.readable;
    next(null, data);
};
