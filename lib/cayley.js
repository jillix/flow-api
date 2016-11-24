// Dependencies
const cayley = require('cayley')

// RDF constants
const RDF_TYPE = 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type';
const FLOW_VOCAB = 'http://schema.jillix.net/vocab/';
const SCHEMA = 'http://schema.org/';

// export the cayley client for custom use
exports.connect = (scope, inst, args, data, next) => {
    inst.client = cayley(scope.env.db);
    inst.g = inst.client.graph;
    next(null, data);
};

/* FIXED CAYLEY QUERIES */

// fixed cayley query
// returns all modules
exports.modules = (g, callback) => {

    return g.V()
    .Tag('subject')
    .Has('<' + RDF_TYPE + '>', '<' + FLOW_VOCAB + 'Module>')
    .Save('<' + SCHEMA + 'name>', 'subject')
    .Save('<' + RDF_TYPE + '>', 'predicate')
    .All();
};

// fixed cayley query
// returns all instances of a module
exports.instances = (g, moduleIRI) => {

    return g.V()
    .Has('<' + FLOW_VOCAB + 'module>', '<' + moduleIRI + '>')
    .Save('<' + FLOW_VOCAB + 'module>', 'subject')
    .Save('<' + RDF_TYPE + '>', 'predicate')
    .All();
};

// fixed cayley query
// returns an instance and its events
exports.instance = (g, instanceIRI) => {

    return g.V('<' + instanceIRI + '>')
    .Tag('subject')
    .Out('<' + FLOW_VOCAB + 'event>', 'predicate')
    .All();
};

// fixed cayley query
// returns an event and all its sequences
exports.event = (g, eventIRI) => {

    const streams = [];
    streams[0] = g.V('<' + eventIRI + '>')
    .Tag('subject')
    .Out('<' + FLOW_VOCAB + 'sequence>', 'predicate').All();

    streams[1] = g.V().Has(
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
    .All();

    return streams;
};

// fixed cayley query
// returns a sequence
exports.handler = (g, handlerID) => {

    return g.V(handlerID)
    .Tag('subject')
    .Out([
        '<' + FLOW_VOCAB + 'instance>',
        '<' + FLOW_VOCAB + 'dataHandler>',
        '<' + FLOW_VOCAB + 'onceHandler>',
        '<' + FLOW_VOCAB + 'streamHandler>',
        '<' + FLOW_VOCAB + 'emit>',
    ], 'predicate')
    .All();
};
