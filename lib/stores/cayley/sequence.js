"use strict"

const RDF_SYNTAX = '<http://www.w3.org/1999/02/22-rdf-syntax-ns#';
const FLOW_VOCAB = '<http://schema.jillix.net/vocab/';
const SCHEMA = '<http://schema.org/';

module.exports = (store, sequence_id, role) => {
    return [

        // sequence details
        store.g.V(sequence_id)
        .Tag('subject')
        .Has(FLOW_VOCAB + 'role>', role)
        .Out([
            FLOW_VOCAB + 'role>',
            FLOW_VOCAB + 'onError>',
            FLOW_VOCAB + 'next>'
        ], 'predicate')
        .All(),

        // sequence handler details
        store.g.V(sequence_id)
        .Has(FLOW_VOCAB + 'role>', role)
        .Out(FLOW_VOCAB + 'handler>')
        .Tag('subject')
        .Out([
            FLOW_VOCAB + 'state>',
            FLOW_VOCAB + 'fn>',
            FLOW_VOCAB + 'next>'
        ], 'predicate')
        .All(),

        // sequence handler args
        store.g.V(sequence_id)
        .Has(FLOW_VOCAB + 'role>', role)
        .Out(FLOW_VOCAB + 'handler>')
        .Tag('subject')
        .Out(FLOW_VOCAB + 'args>', 'predicate')
        .Out(FLOW_VOCAB + 'json>')
        .Out(RDF_SYNTAX + 'string>')
        .All()
    ];
};
