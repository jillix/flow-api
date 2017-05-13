"use strict"

// RDF constants
const RDF_SYNTAX = '<http://www.w3.org/1999/02/22-rdf-syntax-ns#';
const FLOW_VOCAB = '<http://schema.jillix.net/vocab/';
const SCHEMA = '<http://schema.org/';
const edges = [
    FLOW_VOCAB + 'sequence>',
    FLOW_VOCAB + 'error>',
    FLOW_VOCAB + 'next>',
    FLOW_VOCAB + 'args>',
    FLOW_VOCAB + 'state>'
];

exports.outNodes = (store, node_id) => {

    return [
        // get node name
        store.g.V(node_id)
        .Out(edges)
        .Tag('subject')
        .Save(RDF_SYNTAX + 'type>', 'predicate')
        .Out(SCHEMA + 'name>')
        .Out(RDF_SYNTAX + 'string>')
        .All(),

        // get edges
        store.g.V(node_id)
        .Tag('subject')
        .Out(edges, 'predicate')
        .All(),

        // TODO give functions a name and a descriptor object
        store.g.V(node_id)
        .Tag('subject')
        .Out(FLOW_VOCAB + 'fn>', 'predicate')
        .All()
    ]
}

// TODO write query
// get all sequences for sub types
exports.inSubSequence = (client, user_id) => {
    return [client.g.V().Has(RDF_SYNTAX + 'type>', FLOW_VOCAB + 'Network>')
    .Tag('subject').All()];
};
