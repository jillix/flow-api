// Dependencies
const cayley = require('cayley')

// RDF constants
const RDF_SYNTAX = '<http://www.w3.org/1999/02/22-rdf-syntax-ns#';
const FLOW_VOCAB = '<http://schema.jillix.net/vocab/';
const SCHEMA = '<http://schema.org/';

// export the cayley client for custom use
exports.connect = (scope, state, args, data, next) => {
    state.client = cayley(scope.env.db);
    state.g = state.client.graph;
    return next ? next(null, data) : data;
};

/* FIXED CAYLEY QUERIES */

// fixed cayley query
// reads sequence informations for flow
exports.flow = (g, sequence_id, role) => {

    // base graph
    //const sequence = g.V(sequence_id)
    //.Tag('subject')
    //.Has(FLOW_VOCAB + 'role>', role); 
    //const sequence_handlers = sequence.Out(FLOW_VOCAB + 'handler>', 'predicate');

    return [

        // sequence details
        g.V(sequence_id)
        .Tag('subject')
        .Has(FLOW_VOCAB + 'role>', role)
        .Out([
            FLOW_VOCAB + 'role>',
            FLOW_VOCAB + 'onError>',
            FLOW_VOCAB + 'onEnd>',
            FLOW_VOCAB + 'next>',
        ], 'predicate').All(),

        // sequence handler details
        g.V(sequence_id)
        .Tag('subject')
        .Has(FLOW_VOCAB + 'role>', role)
        .Out(FLOW_VOCAB + 'handler>', 'predicate')
        .Out([
            FLOW_VOCAB + 'state>',
            FLOW_VOCAB + 'data>',
            FLOW_VOCAB + 'once>',
            FLOW_VOCAB + 'stream>',
            FLOW_VOCAB + 'emit>',
            FLOW_VOCAB + 'next>'
        ], 'predicate').All(),

        // sequence handler args
        g.V(sequence_id)
        .Tag('subject')
        .Has(FLOW_VOCAB + 'role>', role)
        .Out(FLOW_VOCAB + 'handler>', 'predicate')
        .Out(FLOW_VOCAB + 'args>', 'predicate')
        .Out(RDF_SYNTAX + 'string>').All()
    ];
};

// fixed cayley query
// returns all modules
exports.sequences = (g) => {

    return g.V()
    .Tag('subject')
    .Has(RDF_SYNTAX + 'type>', FLOW_VOCAB + 'Sequence>')
    .Save(SCHEMA + 'name>', 'subject')
    .Save(RDF_SYNTAX + 'type>', 'predicate')
    .All();
};

// fixed cayley query
// returns all instances of a module
exports.instances = (g, moduleIRI) => {

    return g.V()
    .Has(FLOW_VOCAB + 'module>', '<' + moduleIRI + '>')
    .Save(FLOW_VOCAB + 'module>', 'subject')
    .Save(RDF_SYNTAX + 'type>', 'predicate')
    .All();
};

// fixed cayley query
// returns an instance and its events
exports.instance = (g, instanceIRI) => {

    return g.V('<' + instanceIRI + '>')
    .Tag('subject')
    .Out(FLOW_VOCAB + 'event>', 'predicate')
    .All();
};

// fixed cayley query
// returns an event and all its sequences
exports.event = (g, eventIRI) => {

    const streams = [];
    streams[0] = g.V('<' + eventIRI + '>')
    .Tag('subject')
    .Out(FLOW_VOCAB + 'sequence>', 'predicate').All();

    streams[1] = g.V().Has(
        FLOW_VOCAB + 'event>',
        '<' + eventIRI + '>'
    ).Has(
        RDF_SYNTAX + 'type>',
        FLOW_VOCAB + 'Sequence>'
    ).Tag('subject').Out([
        FLOW_VOCAB + 'dataHandler>',
        FLOW_VOCAB + 'onceHandler>',
        FLOW_VOCAB + 'streamHandler>',
        FLOW_VOCAB + 'emit>',
        FLOW_VOCAB + 'sequence>',
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
        FLOW_VOCAB + 'instance>',
        FLOW_VOCAB + 'dataHandler>',
        FLOW_VOCAB + 'onceHandler>',
        FLOW_VOCAB + 'streamHandler>',
        FLOW_VOCAB + 'emit>',
    ], 'predicate')
    .All();
};
