"use strict"

const Network = require('./network');

// RDF constants
const FLOW_VOCAB = '<http://schema.jillix.net/vocab/';
const SCHEMA = '<http://schema.org/';

function addTarget (client, triples, node, type, target, callback) {

    if (!target) {
        Network.createNodeOfType(client, type, (err, target, data) => {

            if (err) {
                return callback(err);
            }

            triples.push({
                subject: node,
                predicate: FLOW_VOCAB + type + '>',
                object: target
            });

            // add target triples to write data
            if (data && data.length) {
                triples = triples.concat(data);
            }

            callback(null, target, triples);
        });
    } else {
        triples.push([node, FLOW_VOCAB + type + '>', target]);
        callback(null, target, triples);
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

    const triples = [];
    const save = (err, triples) => {

        console.log('SAVE:', err, triples);
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
            addTarget(client, triples, req.node, req.type, req.target, (err, target, triples) => {

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
                        Network.removeOut(client, req.node, [req.type]);

                        save(null, triples);
                    });
                } else {

                    // remove existing type edge on node
                    Network.removeOut(client, req.node, [req.type]);

                    save(null, triples);
                }
            });
            break;

        case "add":

            // add new edge on node
            addTarget(client, triples, req.node, req.type, null, (err, target, triples) => {

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
                    Network.removeOut(client, req.node, ['name', 'json']);
                }

                save(null, triples);
            });
            break; 
    }
};
