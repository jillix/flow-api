"use strict"

const Hash = require('crypto').createHash;

// RDF constants
const RDF_SYNTAX = '<http://www.w3.org/1999/02/22-rdf-syntax-ns#';
const FLOW_VOCAB = '<http://schema.jillix.net/vocab/';
const SCHEMA = '<http://schema.org/';

function UID (len) {
    len = len || 23;
    let i = 0, random = '';
    for (; i < len; ++i) {
        random += '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'[0 | Math.random() * 62];
    }
    return '_:' + Hash('md5').update(random).digest('hex');
}

function inArray(array, id) {
    for (let i = 0, l = array.length; i < l; ++i) {
        if (array[i].id === id) {
            return true;
        }
    }
}

function nodesExists (client, nodes, callback) {
    client.g.V.apply(client.g, nodes).GetLimit(nodes.length, (err, result) => {

        if (err || (result && result.error)) {
            return callback(err || result.error);
        } 

        const exists = [];
        const inexistent = [];

        if (!result) {
            return callback(null, exists, nodes);
        }

        nodes.forEach(node => {
            if (inArray(result, node)) {
                exists.push(node);
            } else {
                inexistent.push(node);
            }
        });

        callback(null, exists, inexistent);
    });
}

exports.createNodeOfType = (client, type) => {

    const node = UID();

    switch (type) {
        case "onError":
        case "onEnd":
            type = 'sequence';
            break;
        case "next":
            // TODO handler type not in data
            // TODO add seq > handler > data/emit/stream
            type = 'data';
        break;
    }

    type = type.charAt(0).toUpperCase() + type.slice(1);

    return {
        uid: node,
        triples: [{
            subject: node,
            predicate: RDF_SYNTAX + 'type>',
            object: FLOW_VOCAB + type + '>'
        }]
    };
};

exports.ensureHashs = (client, values, callback) => {

    const hashs = [];
    values.forEach((value, index) => {
        hashs.push('_:' + Hash('md5').update(value).digest('hex'));
    });

    nodesExists(client, hashs, (err, exists, inexistent) => {

        if (err) {
            return callback(err);
        }

        if (inexistent.length === 0) {
            return callback(null, hashs);
        }

        const triples = [];
        inexistent.forEach((hash) => {
            triples.push({
                subject: hash,
                predicate: RDF_SYNTAX + 'string>',
                object: values[hashs.indexOf(hash)]
            });
        });

        callback(null, hashs, triples);
    });
};

exports.removeOut = (client, node, edges) => {
    console.log('Network: remove "' + edges + '" of node', node);
};
