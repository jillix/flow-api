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

exports.getHandlerInfo = (client, node, type, callback) => {

    let query;
    switch (type) {
        case "sequence":
            query = client.g.V(node).Out(FLOW_VOCAB + 'next>');
            break;
        case "handler":
        case "emit":
            query = client.g.V(node).Save(FLOW_VOCAB + 'next>', 'next').In(FLOW_VOCAB + 'handler>');
            break;
        default:
            return callback(new Error('Flow-API.network.getHandlerInfo: Invalid node type "' + type + '"'));
    }
 
    query.GetLimit(1, (err, result) => {

        if (err || (result && result.error)) {
            return callback(err || result.error);
        }

        if (!result || !result[0] || !result[0].id) {
            return callback(null, node);
        }

        if (type === 'sequence') {
            result = {next: result[0].id};
        } else {
            result = {
                next: result[0].next,
                sequence: result[0].id
            };
        }

        callback(null, result);
    });
};

exports.createNodeOfType = (type) => {

    const node = UID();

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

exports.removeOut = (client, node, edges, callback) => {

    // TODO delete nodes with no in edges
    edges.forEach((edge, i) => {
        switch (edge) {
            case "name":
                edges[i] = SCHEMA + edge;
                break;
            case "type":
            case "string":
                edges[i] = RDF_SYNTAX + edge;
                break;
            default:
                edges[i] = FLOW_VOCAB + edge;
        }

        edges[i] += '>';
    });

    client.g.V(node).Tag('subject').Out(edges, 'predicate').All((err, result) => {

        if (err || !result || typeof result === 'string') {
            return callback(err || result);
        }

        const triples = [];
        result.forEach((triple) => {
            triples.push({
                subject: triple.subject,
                predicate: triple.predicate,
                object: triple.id
            });
        });

        client.delete(triples, (err, result) => {

            if (err || !result || typeof result === 'string') {
                return callback(err || result);
            }

            callback();
        });
    }); 
};
