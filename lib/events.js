"use strict"

// Dependencies
const cayley = require('./cayley');

// RDF constants
const RDF_TYPE = 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type';
const FLOW_VOCAB = 'http://schema.jillix.net/vocab/';
const SCHEMA = 'http://schema.org/';

/**
 * Returns an event and its data
 * @name getOne
 *
*/
exports.getOne = (scope, inst, args, data, next) => {

    if (!data.id) {
        return next(new Error('Flow-api.event.getOne: missing handler id.'));
    }

    data.readable = cayley.event(inst.g, data.id);
    data.readable[0].pause();
    data.readable[1].pause();
    data.resume = data.readable;
    next(null, data);
};

/**
 * Creates an event
 * @name create
 *
*/
exports.create = (scope, inst, args, data, next) => {

};


/**
 * Returns details of an event
 * @name details
 *
*/
exports.details = (scope, inst, args, data, next) => {

    if (!data.id) {
        return next(new Error('Flow-api.events.details: Missing event id.'));
    }

    // test result
    let result = {
        '@context': 'http://schema.jillix.net/context/instance.json',
        '@type': 'FlowEvent',
        '@id': data.id,
        'name': data.id.substring(data.id.lastIndexOf('/') + 1)
    };

    data.body = result;
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

/**
 * Returns details of a handler
 * @name handlerDetails
 *
*/
exports.handlerDetails = (scope, inst, args, data, next) => {

    if (!data.id) {
        return next(new Error('Flow-api.events.handlerDetails: Missing handler id.'));
    }

    // test result
    let result = {
        '@context': 'http://schema.jillix.net/context/instance.json',
        '@type': 'Sequence',
        '@id': data.id,
        'name': 'some name'
    };

    data.result = result;
    next(null, data);

};
