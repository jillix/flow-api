"use strict"

// RDF constants
const RDF_TYPE = 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type';
const FLOW_VOCAB = 'http://schema.jillix.net/vocab/';
const SCHEMA = 'http://schema.org/';

exports.read = (scope, inst, args, data, next) => {

    const eventIRI = '<' + data.event + '>';
    const role = data.session ? data.session.role || '*' : '*';

    // event
    const stream1 = inst.g.V(eventIRI).Tag('subject').Out([
        '<' + FLOW_VOCAB + 'onError>',
        '<' + FLOW_VOCAB + 'onEnd>',
        '<' + FLOW_VOCAB + 'sequence>'
    ], 'predicate').All();

    // sequences
    const stream2 = inst.g.V().Has(
        '<' + FLOW_VOCAB + 'event>',
        eventIRI
    ).Has(
        '<' + RDF_TYPE + '>',
        '<' + FLOW_VOCAB + 'Sequence>'
    ).Tag('subject').Out([
        '<' + FLOW_VOCAB + 'instance>',
        '<' + FLOW_VOCAB + 'args>',
        '<' + FLOW_VOCAB + 'dataHandler>',
        '<' + FLOW_VOCAB + 'onceHandler>',
        '<' + FLOW_VOCAB + 'streamHandler>',
        '<' + FLOW_VOCAB + 'emit>',
        '<' + FLOW_VOCAB + 'sequence>'
    ], 'predicate').All();

    // instances
    const stream3 = inst.g.V().Has(
        '<' + FLOW_VOCAB + 'event>',
        eventIRI
    ).Has(
        '<' + RDF_TYPE + '>',
        '<' + FLOW_VOCAB + 'Sequence>'
    ).Out('<' + FLOW_VOCAB + 'instance>').
    Has('<' + FLOW_VOCAB + 'roles>', role).
    Tag('subject').Out([
        '<' + FLOW_VOCAB + 'args>',
        '<' + FLOW_VOCAB + 'roles>',
        '<' + FLOW_VOCAB + 'module>'
    ], 'predicate').All();

    stream1.pause();
    stream2.pause();
    stream3.pause();

    data.resume = [stream1, stream2, stream3];

    data.readable = data.readable || [];
    data.readable.push(stream1, stream2, stream3);

    next(null, data);
};

exports.mod = (scope, inst, args, data, next) => {

    // TODO role check for modules
    const stream = inst.g.V('<' + data.module + '>').Out([
        '<' + SCHEMA + 'name>',
        '<' + FLOW_VOCAB + 'gitRepository>'
    ], 'predicate').GetLimit(2);
    stream.pause();

    data.resume = stream;
    data.readable = stream;
    next(null, data);
};
