"use strict"

const cayley = require("cayley");
const JSONStream = require("JSONStream");
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
    const getObject = (node) => {
        return g.V(id)
        .Tag('subject')
        .Out(FLOW_VOCAB + 'json>', 'predicate')
        .Out(RDF_SYNTAX + 'string>', 'predicate')
        .All()
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

    const combineAndParse = (streams) => {

        // parse cayley result
        streams.forEach((stream, i) => {
            streams[i] = streams[i].pipe(JSONStream.parse('result.*'));
        });

        // merge all data into one stream and parse object triples to array triples 
        return Triples.combine(streams).pipe(Triples.toArray());
    };

    // export store adapter
    return adapters[config] = Object.freeze({
        sequence: (sequence_id, role) => {
            return combineAndParse(sequence(client, sequence_id, role));
        },
        entrypoint: (entrypoint_name) => {
            return combineAndParse(entrypoint(client, entrypoint_name));
        },
        outNodeNames: visualization.outNodeNames,
        outNodeNamesFn: visualization.outNodeNamesFn,
        networks: visualization.networks, // TODO move to service api
        getObject: getObject,
        incomming: incomming,
        outgoing: outgoing,
        remove: remove,
        write: write
    });
};
