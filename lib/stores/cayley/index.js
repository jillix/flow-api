"use strict"

const cayley = require("cayley");
const Combine = require("stream-combiner");
const Triples = require("./triples");
const entrypoint = require("./entrypoint");
const sequence = require("./sequence");
const visualization = require("./visualization");
const adapters = {};

// RDF constants
const RDF_SYNTAX = '<http://www.w3.org/1999/02/22-rdf-syntax-ns#';
const FLOW_VOCAB = '<http://schema.jillix.net/vocab/';
const SCHEMA = '<http://schema.org/';

module.exports = (config) => {

    // singleton
    if (adapters[config]) {
        return adapters[config];
    }

    const client = cayley(config);
    const incomming = (node, edges) => {
        return client.g.V.apply(client.g, nodes).Tag("o").In(null, "p").All();
    };
    const outgoing = (node, edges) => {
        return client.g.V.apply(client.g, nodes).Tag("s").Out(edges, "p").All();
    };
    const getObject = (id) => {
        return client.g.V(id)
        .Tag('subject')
        .Out([
            SCHEMA + 'name>',
            FLOW_VOCAB + 'json>']
        , 'predicate')
        .Out(RDF_SYNTAX + 'string>')
        .GetLimit(2);
    };
    const getName = (id) => {
        return client.g.V(id)
        .Tag('subject')
        .Out(SCHEMA + 'name>', 'predicate')
        .Out(RDF_SYNTAX + 'string>')
        .GetLimit(1);
    };
    const write = (triples) => {
        if (triples && triples.length) {
            return client.write(triples);
        }
    };
    const remove = (triples) => {
        if (triples && triples.length) {
            return client.delete(triples);
        }
    };

    // export store adapter
    return adapters[config] = Object.freeze({
        sequence: (sequence_id, role, objectMode) => {
            return Triples.parse(sequence(client, sequence_id, role), objectMode);
        },
        entrypoint: (entrypoint_name, objectMode) => {
            return Triples.parse(entrypoint(client, entrypoint_name), objectMode);
        },
        outNodes: (id) => {
            return Triples.parse(visualization.outNodes(client, id));
        },
        // TODO move to service api
        networks: (id) => {
            return Triples.parse(visualization.networks(client, id));
        },
        getObject: (id) => {
            return Triples.parse(getObject(id));
        },
        getName: (id) => {
            return Triples.parse(getName(id));
        },
        incomming: incomming,
        outgoing: outgoing,
        remove: remove,
        write: write
    });
};
