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

function inArray(array, id) {
    for (let i = 0, l = array.length; i < l; ++i) {
        if (array[i].id === id) {
            return true;
        }
    }
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
            if (inArray(result, node)) {
                exists.push(node);
            } else {
                inexistent.push(node);
            }
        });

        callback(null, exists, inexistent);
    });
}

function getIn (client, from, nodes, callback) {

    const remove = [];
    const nodeIn = {};
    const outNodes = [];

    // create from node index, for counting in connections
    const fromIndex = {};
    if (from instanceof Array) {
        from.forEach((node) => {fromIndex[node] = true});
    } else {
        from = null;
    }

    client.g.V.apply(client.g, nodes).Tag('o').In(null, 'p').All((err, result) => {

        if (err = error(err, result, true)) {
            return callback(err);
        }

        if (result) {
            result.forEach((triple) => {

                if (nodeIn[triple.o] === undefined) {
                    nodeIn[triple.o] = 0;
                }
                // remove from > p > node triples
                if (!from) {
                    remove.push({
                        subject: triple.id,
                        predicate: triple.p,
                        object: triple.o
                    });

                // don't delete nodes with more in connections
                } else if (!fromIndex[triple.id]){
                    ++nodeIn[triple.o];
                }
            });

            for (let node in nodeIn) {
                if (nodeIn[node] === 0) {
                    if (node.indexOf('"') > -1) {
                        node = node.replace(/"/g, '\\"');
                    }
                    outNodes.push(node);
                }
            }
        }

        if (outNodes.length) {
            getOut(client, outNodes, null, (err, result) => {

                if (err) {
                    return callback(err);
                }

                result.forEach(triple => remove.push(triple));

                callback(null, remove);
            });
        } else {
            callback(null, remove);
        }
    });
};

function getOut (client, nodes, edges, callback) {

    if (edges instanceof Array) {
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
    } else {
        edges = null;
    }

    client.g.V.apply(client.g, nodes).Tag('s').Out(edges, 'p').All((err, result) => {

        if (err = error(err, result)) {
            return callback(err);
        }

        const triples = [];
        const outNodes = [];
        const outNodeIndex = {};
        if (result) {
            result.forEach((triple) => {

                // collect object nodes to remove recursively
                outNodeIndex[triple.id] = true;

                triples.push({
                    subject: triple.s,
                    predicate: triple.p,
                    object: triple.id
                });
            });

            for (let node in outNodeIndex) {
                if (node.indexOf('"') > -1) {
                    node = node.replace(/"/g, '\\"');
                }
                outNodes.push(node);
            }
        }

        if (outNodes.length) {
            getIn(client, nodes, outNodes, (err, result) => {

                if (err) {
                    return callback(err);
                }

                result.forEach(triple => triples.push(triple));

                callback(null, triples);
            });
        } else {
            callback(null, triples);
        }
    });
}

exports.write = (client, triples, callback) => {
    if (triples && triples.length) {
        client.write(triples, (err, result) => {
            callback(error(err, result), result)
        });
    } else {
        callback();
    }
};

exports.remove = (client, triples, callback) => {
    if (triples && triples.length) {
        client.delete(triples, (err, result) => {
            callback(error(err, result), result)
        });
    } else {
        callback();
    }
};

exports.getHandlerInfo = (client, node, type, callback) => {

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

exports.removeNodes = getIn;
exports.removeOut = getOut;
