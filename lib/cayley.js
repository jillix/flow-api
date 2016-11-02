// Dependencies
const cayley = require('cayley')
const client = cayley(process.flow_env.db);
const g = client.graph;

// RDF constants
const RDF_TYPE = 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type';
const FLOW_VOCAB = 'http://schema.jillix.net/vocab/';
const SCHEMA = 'http://schema.org/';

// export the cayley client for custom use
exports.client = client;

/* FIXED CAYLEY QUERIES */

// fixed cayley query
// returns all modules
exports.modules = (callback) => {

    g.V()
    .Tag('subject')
    .Has('<' + RDF_TYPE + '>', '<' + FLOW_VOCAB + 'Module>')
    .Save('<' + SCHEMA + 'name>', 'subject')
    .Save('<' + RDF_TYPE + '>', 'predicate')
    .All(buildResult(callback));
};

// fixed cayley query
// returns all instances of a module
exports.instances = (moduleIRI, callback) => {

    if (!moduleIRI) {
        return callback(null, []);
    }

    g.V()
    .Has('<' + FLOW_VOCAB + 'module>', '<' + moduleIRI + '>')
    .Save('<' + FLOW_VOCAB + 'module>', 'subject')
    .Save('<' + RDF_TYPE + '>', 'predicate')
    .All(buildResult(callback));
};

// fixed cayley query
// returns an instance and its events
exports.instance = (instanceIRI, callback) => {

    if (!instanceIRI) {
        return callback(null, []);
    }

    g.V('<' + instanceIRI + '>')
    .Tag('subject')
    .Out('<' + FLOW_VOCAB + 'event>', 'predicate')
    .All(buildResult(callback));
};

// fixed cayley query
// returns an event and all its sequences
exports.event = (eventIRI, callback) => {

    if (!eventIRI) {
        return callback(null, []);
    }

    console.log(eventIRI);
    g.V('<' + eventIRI + '>')
    .Tag('subject')
    .Out('<' + FLOW_VOCAB + 'sequence>', 'predicate').All(buildResult((error, result) => {

        if (error) {
            return callback(error);
        }

        g.V().Has(
            '<' + FLOW_VOCAB + 'event>',
            '<' + eventIRI + '>'
        ).Has(
            '<' + RDF_TYPE + '>',
            '<' + FLOW_VOCAB + 'Sequence>'
        ).Tag('subject').Out([
            '<' + FLOW_VOCAB + 'dataHandler>',
            '<' + FLOW_VOCAB + 'onceHandler>',
            '<' + FLOW_VOCAB + 'streamHandler>',
            '<' + FLOW_VOCAB + 'emit>',
            '<' + FLOW_VOCAB + 'sequence>',
        ], 'predicate')
        .All(buildResult((error, sequenceResut) => {

            if (error) {
                return callback(error);
            }

            result = result.concat(sequenceResut);
            return callback(null, result);
        }));
    }));
};

// fixed cayley query
// returns a sequence
exports.handler = (handlerID, callback) => {

    if (!handlerID) {
        return callback(null, []);
    }

    g.V(handlerID)
    .Tag('subject')
    .Out([
        '<' + FLOW_VOCAB + 'instance>',
        '<' + FLOW_VOCAB + 'dataHandler>',
        '<' + FLOW_VOCAB + 'onceHandler>',
        '<' + FLOW_VOCAB + 'streamHandler>',
        '<' + FLOW_VOCAB + 'emit>',
    ], 'predicate')
    .All(buildResult(callback));
};

let buildResult = (callback) => {
    return (error, cayleyResult) => {

        if (error) {
            return callback(error);
        }

        var result = [];
        if (cayleyResult && cayleyResult.length) {
            cayleyResult.forEach(triple => result.push([
                triple.subject[0] === '<' ? triple.subject.slice(1, -1) : triple.subject,
                triple.predicate.slice(1, -1),
                triple.id[0] === '<' ? triple.id.slice(1, -1) : triple.id,
            ]));
        }

        return callback(null, result);
    }
}