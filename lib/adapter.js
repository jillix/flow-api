"use strict"

// RDF constants
const RDF_TYPE = '<http://www.w3.org/1999/02/22-rdf-syntax-ns#type>';
const FLOW_VOCAB = '<http://schema.jillix.net/vocab/';
const SCHEMA = 'http://schema.org/';

exports.read = (scope, state, args, data, next) => {

    const role = data.session ? data.session.role || '*' : '*';
    const sequence_id = '_:' + data.event;
console.log('Flow-api.adapter.read:', sequence_id);
    // sequence
    const stream1 = state.g.V(sequence_id).Tag('subject')
    .Has(FLOW_VOCAB + 'roles>', role)
    .Out([
        FLOW_VOCAB + 'roles>',
        FLOW_VOCAB + 'onError>',
        FLOW_VOCAB + 'onEnd>',
        FLOW_VOCAB + 'next>',
    ], 'predicate').All();

    // handlers
    const stream2 = state.g.V().Has(
        FLOW_VOCAB + 'sequence>',
        sequence_id
    ).Has(
        RDF_TYPE,
        FLOW_VOCAB + 'Handler>'
    ).Tag('subject').Out([
        FLOW_VOCAB + 'state>',
        FLOW_VOCAB + 'args>',
        FLOW_VOCAB + 'data>',
        FLOW_VOCAB + 'once>',
        FLOW_VOCAB + 'stream>',
        FLOW_VOCAB + 'emit>',
        FLOW_VOCAB + 'next>'
    ], 'predicate').All(); 

    stream1.pause();
    stream2.pause();

    data.resume = [stream1, stream2];

    data.readable = data.readable || [];
    data.readable.push(stream1, stream2);

    next(null, data);
};

exports.mod = (scope, state, args, data, next) => {

    // TODO role check for modules
    const stream = state.g.V('<' + data.module + '>').Out([
        '<' + SCHEMA + 'name>',
        '<' + FLOW_VOCAB + 'gitRepository>'
    ], 'predicate').GetLimit(2);
    stream.pause();

    data.resume = stream;
    data.readable = stream;
    next(null, data);
};
