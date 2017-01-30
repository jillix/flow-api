"use strict"

const Hash = require('crypto').createHash;

// RDF constants
const RDF_SYNTAX = '<http://www.w3.org/1999/02/22-rdf-syntax-ns#';
const FLOW_VOCAB = '<http://schema.jillix.net/vocab/';
const SCHEMA = '<http://schema.org/';

function error (err, result, emptyIsError) {
    if (err || typeof result === 'string') {
        return err || new Error(result);
    }

    if (emptyIsError && (!result || !result.length)) {
        return new Error('Flow-Api.error: Empty result.');
    }
}

function UID (len) {
    len = len || 23;
    let i = 0, random = '';
    for (; i < len; ++i) {
        random += '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'[0 | Math.random() * 62];
    }
    return '_:' + Hash('md5').update(random).digest('hex');
}

function inArray(array, id, key) {
    for (let i = 0, l = array.length; i < l; ++i) {
        if (array[i].id === id) {
            return i;
        }
    }

    return -1;
}

function nodesExists (client, nodes, callback) {
    client.g.V.apply(client.g, nodes).GetLimit(nodes.length, (err, result) => {

        if (err = error(err, result)) {
            return callback(err);
        } 

        const exists = [];
        const inexistent = [];

        if (!result) {
            return callback(null, exists, nodes);
        }

        nodes.forEach(node => {
            if (inArray(result, node) > -1) {
                exists.push(node);
            } else {
                inexistent.push(node);
            }
        });

        callback(null, exists, inexistent);
    });
}

function getHandlerInfo (client, node, type, callback) {

    let query;
    switch (type) {
        case "sequence":
            query = client.g.V(node).Out(FLOW_VOCAB + 'next>');
            break;
        case "handler":
            query = client.g.V(node).Save(FLOW_VOCAB + 'next>', 'next').In(FLOW_VOCAB + 'handler>');
            break;
        default:
            return callback(new Error('Flow-API.network.getHandlerInfo: Invalid node type "' + type + '"'));
    }
 
    query.GetLimit(1, (err, result) => {

        if (err = error(err, result)) {
            return callback(err);
        }

        if (!result || !result[0] || !result[0].id) {
            return callback(null, {sequence: node});
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

exports.getHandlerInfo = getHandlerInfo;

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
