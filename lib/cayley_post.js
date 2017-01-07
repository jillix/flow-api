"use strict"

const Network = require('./network');

// RDF constants
const FLOW_VOCAB = '<http://schema.jillix.net/vocab/';
const SCHEMA = '<http://schema.org/';

function addTarget (client, triples, node, type, target, callback) {

    if (!target) {
        Network.createNodeOfType(client, type, (err, target) => {

            if (err) {
                return callback(err);
            }

            triples.push([node, FLOW_VOCAB + type + '>', target]);
            callback(null, target, triples);
        });
    } else {
        triples.push([node, FLOW_VOCAB + type + '>', target]);
        callback(null, target, triples);
    }
}

function addHashTriples (client, triples, node, name, json, callback) {

    const values = [name];
    json && values.push(json);

    Network.ensureHashs(client, values, (err, hashs, strings) => {

        if (err) {
            return callback(err);
        }

        triples.push([node, SCHEMA + 'name>', hashs[0]]);
        hashs[1] && triples.push([node, FLOW_VOCAB + 'json>', hashs[1]]);

        // add hash > string > value triples to write data
        if (strings && strings.length) {
            triples = triples.concat(strings);
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

        //client.write(triples);
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
                    addHashTriples(client, triples, target, req.name, req.json, (err, triples) => {

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
                addHashTriples(client, triples, target, req.name, req.json, save);
            });
            break;

        case "edit":

            // set new name and json edges on node
            addHashTriples(client, triples, req.node, req.name, req.json, (err) => {

                if (err) {
                    return callback(err);
                }

                // remove name and json eges on node
                Network.removeOut(client, req.node, ['name', 'json']);

                save(null, triples);
            });
            break; 
    }
};
