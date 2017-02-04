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

    const combineAndParse = (streams) => {
        if (streams instanceof Array) {

            // parse cayley result
            streams.forEach((stream, i) => {
                streams[i] = streams[i].pipe(JSONStream.parse('result.*'));
            });

            // merge all data into one stream 
            streams = Triples.combine(streams);
        } else {

            // parse cayley result
            streams = streams.pipe(JSONStream.parse('result.*'));
        }

        // parse object triples to array triples
        return streams.pipe(Triples.toArray());
    };

    // export store adapter
    return adapters[config] = Object.freeze({
        sequence: (sequence_id, role) => {
            return combineAndParse(sequence(client, sequence_id, role));
        },
        entrypoint: (entrypoint_name) => {
            return combineAndParse(entrypoint(client, entrypoint_name));
        },
        outNodes: (id) => {
            return combineAndParse(visualization.outNodes(client, id));
        },
        // TODO move to service api
        networks: (id) => {
            return combineAndParse(visualization.networks(client, id));
        },
        getObject: (id) => {
            return combineAndParse(getObject(id));
        },
        getName: (id) => {
            return combineAndParse(getName(id));
        },
        incomming: incomming,
        outgoing: outgoing,
        remove: remove,
        write: write
    });
};
