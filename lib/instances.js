// Dependencies
const cayley = require('./cayley');

// RDF constants
const RDF_TYPE = 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type';
const FLOW_VOCAB = 'http://schema.jillix.net/vocab/';
const SCHEMA = 'http://schema.org/';

/**
 * Returns all instances of a module
 * @name get
 *
*/
exports.get = (scope, inst, args, data, next) => {

    if (!data.id) {
        return next(new Error('Flow-api.instances.get: missing module id.'));
    }

    data.readable = cayley.instances(inst.g, data.id);
    data.readable.pause();
    data.resume = data.readable;
    next(null, data);
};

/**
 * Returns an instance and its data
 * @name getOne
 *
*/
exports.getOne = (scope, inst, args, data, next) => {

    if (!data.id) {
        return next(new Error('Flow-api.instances.getOne: missing instance id.'));
    }

    data.readable = cayley.instance(inst.g, data.id);
    data.readable.pause();
    data.resume = data.readable;
    next(null, data);
};

/**
 * Creates an instance
 * @name create
 *
*/
exports.create = (scope, inst, args, data, next) => {
    data.body = [];
    return next(null, data);
};

/**
 * Returns details of an instance
 * @name details
 *
*/
exports.details = (scope, inst, args, data, next) => {

    if (!data.id) {
        return next(new Error('Flow-api.instance.details: Missing instance id.'));
    }

    // test result
    let result = {
        '@context': 'http://schema.jillix.net/context/instance.json',
        '@type': 'ModuleInstanceConfig',
        '@id': data.id,
        'name': data.id
    };

    data.body = result;
    next(null, data);
};