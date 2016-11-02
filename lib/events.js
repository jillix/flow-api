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
exports.event = (args, data, next) => {

    if (!data.id) {
        return next(new Error('Flow-api.event.event: missing handler id.'));   
    }

    cayley.event(data.id, (error, result) => {

        if (error) {
            return next(new Error('Flow-api.event.event: ' + error.message));
        }

        data.result = result;
        next(null, data);
    });
};

/**
 * Returns a handler and its data
 * @name handler
 *
*/
exports.handler = (args, data, next) => {

    if (!data.id) {
        return next(new Error('Flow-api.event.handler: missing handler id.'));   
    }

    cayley.handler(data.id, (error, result) => {

        if (error) {
            return next(new Error('Flow-api.event.handler: ' + error.message));
        }

        data.result = result;
        next(null, data);
    });
};