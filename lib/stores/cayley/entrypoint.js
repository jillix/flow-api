"use strict"

const RDF_SYNTAX = '<http://www.w3.org/1999/02/22-rdf-syntax-ns#';
const FLOW_VOCAB = '<http://schema.jillix.net/vocab/';
const SCHEMA = '<http://schema.org/';

module.exports = (store, entrypoint_name) => {
    return [

        // get entrypoint vars
        store.g.V(entrypoint_name)
        .Tag('subject')
        .In().In()
        .Has(RDF_SYNTAX + 'type>', FLOW_VOCAB + 'Entrypoint>')
        .Out(FLOW_VOCAB + 'environment>', 'predicate')
        .Out(FLOW_VOCAB + 'json>')
        .Out(RDF_SYNTAX + 'string>')
        .All(),

        // get sequence
        store.g.V(entrypoint_name)
        .Tag('subject')
        .In().In()
        .Has(RDF_SYNTAX + 'type>', FLOW_VOCAB + 'Entrypoint>')
        .Out(FLOW_VOCAB + 'sequence>', 'predicate')
        .All()
    ];
};
