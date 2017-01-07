"use strict"

// RDF constants
const RDF_SYNTAX = '<http://www.w3.org/1999/02/22-rdf-syntax-ns#';
const FLOW_VOCAB = '<http://schema.jillix.net/vocab/';
const SCHEMA = '<http://schema.org/';

function getNameNodes (g, id, edgeTypes) {

    const edges = [];
    edgeTypes.forEach(edge => edges.push(FLOW_VOCAB + edge + '>'));

    return [
        // get entrypoint nodes
        g.V(id)
        .Out(edges)
        .Tag('subject')
        .Save(RDF_SYNTAX + 'type>', 'predicate')
        .Out(SCHEMA + 'name>')
        .Out(RDF_SYNTAX + 'string>')
        .All(),

        // get entrypoint edges
        g.V(id)
        .Tag('subject')
        .Out(edges, 'predicate')
        .All()
    ]
}
 
/* VISUALIZATION QUERIES */

// get network nodes with name
exports.vis_networks = (g, user_id) => {
    return g.V().Has(RDF_SYNTAX + 'type>', FLOW_VOCAB + 'Network>')
    .Tag('subject')
    .Save(RDF_SYNTAX + 'type>', 'predicate')
    .Out(SCHEMA + 'name>')
    .Out(RDF_SYNTAX + 'string>')
    .All();
};

// get all entrypoints of a network
exports.vis_entrypoints = (g, network_id) => {
    return getNameNodes(g, network_id, ['entrypoint']);
};

// get details of an entrypoint
exports.vis_entrypoint = (g, entrypoint_id) => {
    return getNameNodes(g, entrypoint_id, ['sequence', 'environment']);
};

// get details of a sequence inclusive handlers
exports.vis_sequence = (g, sequence_id) => {
    return getNameNodes(g, sequence_id, ['onEnd', 'onError', 'next']); 
};

// get details of a handler 
exports.vis_handler = (g, handler_id) => {
    const arg = getNameNodes(g, handler_id, ['args', 'next', 'sequence', 'state']);
    arg.push(
        g.V(handler_id)
        .Tag('subject')
        .Out(FLOW_VOCAB + 'fn>', 'predicate')
        .All()
    );
    return arg;
};

exports.vis_object = (g, object_id) => {
    return getNameNodes(g, object_id, ['sequence']);
};
