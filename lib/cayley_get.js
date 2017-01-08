"use strict"

// RDF constants
const RDF_SYNTAX = '<http://www.w3.org/1999/02/22-rdf-syntax-ns#';
const FLOW_VOCAB = '<http://schema.jillix.net/vocab/';
const SCHEMA = '<http://schema.org/';

/* GET NODE QUERIES */

exports.get = (g, id, type, role) => {

    return g.V(id)
    .Tag('subject')
    .Out(FLOW_VOCAB + 'json>', 'predicate')
    .Out(RDF_SYNTAX + 'string>', 'predicate')
    .All();
};
