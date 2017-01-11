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

function getIn (client, from, nodes, callback, remove) {

    remove = remove || [];

    const outNodes = [];
    const nodeIndex = {};
    const fromIndex = {};

    if (from instanceof Array) {
        from.forEach((node) => {fromIndex[node] = true});
    } else {
        from = null;
    }

    nodes.forEach((node) => {nodeIndex[node] = true});

    client.g.V.apply(client.g, nodes).Tag('o').In(null, 'p').All((err, result) => {

        if (err = error(err, result, true)) {
            return callback(err);
        }

        if (result) {
            result.forEach((triple) => {

                // TODO collect subject (triple.id) for: subject > next > object

                // escape quotes
                let object = triple.o;
                if (triple.o.indexOf('"') > -1) {
                    triple.o = triple.o.replace(/"/g, '\\"')
                }

                // remove from > p > node triples
                if (!from || fromIndex[triple.id]) {
                    remove.push({
                        subject: triple.id,
                        predicate: triple.p,
                        object: triple.o 
                    }); 

                // don't delete nodes with more then one in connections
                } else {
                    nodeIndex[object] = false;
                }
            });

            for (let node in nodeIndex) {
                if (nodeIndex[node]) {
                    if (node.indexOf('"') > -1) {
                        node = node.replace(/"/g, '\\"');
                    }
                    outNodes.push(node);
                }
            };
        }

        callback(null, outNodes, remove);
    });
};

function getOut (client, nodes, edges, callback, remove) {

    remove = remove || [];

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

        const outNodes = [];
        const outNodeIndex = {};
        if (result) {
            result.forEach((triple) => {

                switch (triple.p) {
                    case FLOW_VOCAB + 'next>':
                        // TODO replace next edge, with next edge of next handler
                        // TODO collect object (triple.id) for: subject > next > object
                        remove.push({
                            subject: triple.s,
                            predicate: triple.p,
                            object: triple.id
                        });
                        break;
                    case RDF_SYNTAX + 'type>': 
                        remove.push({
                            subject: triple.s,
                            predicate: triple.p,
                            object: triple.id
                        });
                        break;
                    default:
                        outNodeIndex[triple.id] = true;
                }
            });

            for (let node in outNodeIndex) {
                if (node.indexOf('"') > -1) {
                    node = node.replace(/"/g, '\\"');
                }
                outNodes.push(node);
            }
        }

        if (outNodes.length) {
            getIn(client, nodes, outNodes, (err, outNodes, triples) => {

                if (err) {
                    return callback(err);
                }

                if (outNodes.length) {
                    return getOut(client, outNodes, null, callback, remove);
                } else {
                    callback(null, remove);
                }

            }, remove);
        } else {
            callback(null, remove);
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

exports.removeNodes = (client, from, nodes, callback) => {
    getIn(client, from, nodes, (err, outNodes, remove) => {

        if (err) {
            return callback(err);
        }

        getOut(client, nodes, null, callback, remove);
    });
};

exports.removeOut = getOut;
