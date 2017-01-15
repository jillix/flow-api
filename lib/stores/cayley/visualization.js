"use strict"

// RDF constants
const RDF_SYNTAX = '<http://www.w3.org/1999/02/22-rdf-syntax-ns#';
const FLOW_VOCAB = '<http://schema.jillix.net/vocab/';
const SCHEMA = '<http://schema.org/';
const edges = [
    FLOW_VOCAB + 'entrypoint>',
    FLOW_VOCAB + 'environment>',
    FLOW_VOCAB + 'sequence>',
    FLOW_VOCAB + 'onError>',
    FLOW_VOCAB + 'onEnd>',
    FLOW_VOCAB + 'next>',
    FLOW_VOCAB + 'args>',
    FLOW_VOCAB + 'state>'
];

function getOutNodeNames (g, id) {

    return [
        // get node name
        g.V(id)
        .Out(edges)
        .Tag('subject')
        .Save(RDF_SYNTAX + 'type>', 'predicate')
        .Out(SCHEMA + 'name>')
        .Out(RDF_SYNTAX + 'string>')
        .All(),

        // get edges
        g.V(id)
        .Tag('subject')
        .Out(edges, 'predicate')
        .All()
    ]
}

exports.outNodeNames = (store, node_id) => {
    return getOutNodeNames(store.g, node_id);
};

// TODO move this to service api
// get network nodes with name
exports.networks = (client, user_id) => {
    return [client.g.V().Has(RDF_SYNTAX + 'type>', FLOW_VOCAB + 'Network>')
    .Tag('subject')
    .Save(RDF_SYNTAX + 'type>', 'predicate')
    .Out(SCHEMA + 'name>')
    .Out(RDF_SYNTAX + 'string>')
    .All()];
};

// TODO update handler function with a name
exports.outNodeNamesFn = (client, node_id) => {
    const streams = getOutNodeNames(client.g, node_id);
    streams.push(
        client.g.V(handler_id)
        .Tag('subject')
        .Out(FLOW_VOCAB + 'fn>', 'predicate')
        .All()
    );
    return streams;
};
