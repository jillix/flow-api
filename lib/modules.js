// Dependencies
const cayley = require('./cayley');

// RDF constants
const RDF_TYPE = 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type';
const FLOW_VOCAB = 'http://schema.jillix.net/vocab/';
const SCHEMA = 'http://schema.org/';

/**
 * Returns all modules
 * @name get
 *
*/
exports.get = (scope, inst, args, data, next) => {
    data.readable = cayley.modules(inst.g);
    data.readable.pause();
    data.resume = data.readable;
    next(null, data);
};

/**
 * Returns details of a module
 * @name details
 *
*/
exports.details = (scope, inst, args, data, next) => {

    if (!data.id) {
        return next(new Error('Flow-api.modules.details: Missing module id.'));
    }

    // test result
    let result = {
        '@context': 'http://schema.jillix.net/context/module.json',
        '@type': 'Module',
        '@id': data.id,
        'name': data.id.substring(data.id.lastIndexOf('/') + 1)
    };

    data.body = result;
    next(null, data);
};
