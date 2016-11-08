// Dependencies
const cayley = require('./cayley');

// RDF constants
const RDF_TYPE = 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type';
const FLOW_VOCAB = 'http://schema.jillix.net/vocab/';
const SCHEMA = 'http://schema.org/';

/**
 * Returns all modules
 * @name modules
 *
*/
exports.modules = (scope, inst, args, data, next) => {

    cayley.modules(inst.g, (error, result) => {

        if (error) {
            return next(new Error('Flow-api.modules.modules: ' + error.message));
        }

        data.result = result;
        next(null, data);
    });
};

/**
 * Returns all instances of a module
 * @name instances
 *
*/
exports.instances = (scope, inst, args, data, next) => {

    if (!data.id) {
        return next(new Error('Flow-api.modules.instances: missing module id.'));   
    }

    cayley.instances(inst.g, data.id, (error, result) => {

        if (error) {
            return next(new Error('Flow-api.modules.instances: ' + error.message));
        }

        data.result = result;
        next(null, data);
    });
};

/**
 * Returns an instance and its data
 * @name instance
 *
*/
exports.instance = (scope, inst, args, data, next) => {

    if (!data.id) {
        return next(new Error('Flow-api.modules.instance: missing instance id.'));   
    }

    cayley.instance(inst.g, data.id, (error, result) => {

        if (error) {
            return next(new Error('Flow-api.modules.instance: ' + error.message));
        }

        data.result = result;
        next(null, data);
    });
};
