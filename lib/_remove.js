"use strict"

const Hash = require('crypto').createHash;
const Network = require('./network');

// RDF constants
const RDF_SYNTAX = '<http://www.w3.org/1999/02/22-rdf-syntax-ns#';
const FLOW_VOCAB = '<http://schema.jillix.net/vocab/';
const SCHEMA = '<http://schema.org/';

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
    //});
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
    //});
}

// -> from network
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

exports.removeNode = (client, from, node, callback) => {
    getIn(client, from, nodes, (err, outNodes, remove) => {

        if (err) {
            return callback(err);
        }

        getOut(client, nodes, null, callback, remove);
    });
};

const Remove = require('./network_remove');

module.exports = (client, req) => {

    switch (req.mode) {
        case "node":

            // get ins and outs of node
            const db_req = Network.remove(client, result);
            const remove = Remove.node(client, null, req.node);
            let count = 0;
            remove.on('error', (err) => {
                console.log('Remove error:', err);
                db_req.emit('error');
                db_req.end();
                remove.end();
            });
            remove.on('data', (chunk) => {
                ++count;
                console.log('Remove triple:', chunk);
            });
            remove.on('end', () => {
                console.log('Remove ended. Quad removed:', chunk);
            });
            return remove.pipe(db_req);
            //console.log('Remove node:', err, result);
            //callback(null, {info: 'Removed ' + result.length + ' quads.'});

            break;
/*
        case "edge":
            Remove.edge(client, req.node, [req.data], (err, result) => {

                if (err) {
                    return callback(err);
                }

                console.log('Remove edge:', err, result);
                //Network.remove(client, result, callback);
                callback(null, {info: 'Removed ' + result.length + ' quads.'});
            });
            break;
*/
    }
};
