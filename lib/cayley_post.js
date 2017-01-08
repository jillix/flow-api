"use strict"

const Network = require('./network');

// RDF constants
const FLOW_VOCAB = '<http://schema.jillix.net/vocab/';
const SCHEMA = '<http://schema.org/';

function createTarget (triples, node, targetType, type, target) {

    if (!target) {
        target = Network.createNodeOfType(targetType || type);

        triples.push({
            subject: node,
            predicate: FLOW_VOCAB + type + '>',
            object: target.uid
        });

        // add target triples to write data
        if (target.triples && target.triples.length) {
            target.triples.forEach(triple => triples.push(triple));
        }

        return target.uid;

    } else {
        triples.push([node, FLOW_VOCAB + type + '>', target]);
        return target;
    }
};

function addTarget (client, triples, node, nodeType, type, target, callback) {

    let targetType;
    if (type.indexOf(':')) {
        type = type.split(':');
        targetType = type[1];
        type = type[0];
    }

    if (type === 'next') {
        Network.getHandlerInfo(client, node, nodeType, (err, info) => {

            if (err) {
                return callback(err);
            }

            target = createTarget(triples, node, targetType, type, target);

            // add next handler to new handler
            if (info.next) {
                triples.push({
                    subject: target,
                    predicate: FLOW_VOCAB + 'next>',
                    object: info.next
                });
            }

            // add handler to sequence
            if (info.sequence) {
                triples.push({
                    subject: info.sequence,
                    predicate: FLOW_VOCAB + 'handler>',
                    object: target
                });
            }

            callback(null, target, triples);
        });
    } else {
        callback(null, createTarget(triples, node, targetType, type, target), triples);
    } 
}

function addHashTriples (client, triples, node, name, json, edit, callback) {

    const values = [name];
    json && values.push(json);

    Network.ensureHashs(client, values, (err, hashs, data) => {

        if (err) {
            return callback(err);
        }

        if ((edit && data && data.length) || !edit) {
            triples.push({
                subject: node,
                predicate: SCHEMA + 'name>',
                object: hashs[0]
            });

            hashs[1] && triples.push({
                subject: node,
                predicate: FLOW_VOCAB + 'json>',
                object: hashs[1]
            });
        }

        // add hash > string > value triples to write data
        if (data && data.length) {
            triples = triples.concat(data);
        }

        callback(null, triples);
    });
}

module.exports = (client, req, callback) => {

    let target;
    const triples = [];
    const save = (err, triples) => {

        if (err) {
            return callback(err);
        }

        if (triples.length) {
            client.write(triples, (err, result) => {

                if (err || typeof result === 'string') {
                    return callback(err || result);
                }

                if (result && result[0] && result[0].error) {
                    return callback(result.error);
                }

                callback(null, result);
            });
        }
    };

    switch (req.mode) {
        case "set":

            // ensure target and set new edge on node
            addTarget(client, triples, req.node, req.type, req.data, req.target, (err, target, triples) => {

                if (err) {
                    return callback(err);
                }

                // set new values on target, if no replace target is in request
                if (!req.target) {
                    addHashTriples(client, triples, target, req.name, req.json, false, (err, triples) => {

                        if (err) {
                            return callback(err);
                        }

                        // remove existing type edge on node
                        Network.removeOut(client, req.node, [req.data.split(':')[0]], (err) => {

                            if (err) {
                                return callback(err);
                            }

                            save(null, triples);
                        });
                    });
                } else {

                    // remove existing type edge on node
                    Network.removeOut(client, req.node, [req.type.split(':')[0]], (err) => {

                        if (err) {
                            return callback(err);
                        }

                        save(null, triples);
                    });
                }
            });
            break;

        case "add":

            // add new edge on node
            addTarget(client, triples, req.node, req.type, req.data, null, (err, target, triples) => {

                if (err) {
                    return callback(err);
                }

                // set hash edges on target node
                addHashTriples(client, triples, target, req.name, req.json, false, save);
            });
            break;

        case "edit":

            // set new name and json edges on node
            addHashTriples(client, triples, req.node, req.name, req.json, true, (err, triples) => {

                if (err) {
                    return callback(err);
                }

                // remove name and json eges on node
                if (triples.length) {
                    Network.removeOut(client, req.node, ['name', 'json'], (err) => {

                        if (err) {
                            return callback(err);
                        }

                        save(null, triples);
                    });
                } else {
                    save(null, triples);
                }
            });
            break; 
    }
};
