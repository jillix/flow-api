"use strict"

const crypto = require('crypto');

// RDF constants
const RDF_SYNTAX = '<http://www.w3.org/1999/02/22-rdf-syntax-ns#';
const FLOW_VOCAB = '<http://schema.jillix.net/vocab/';
const SCHEMA = '<http://schema.org/';

function inArray(array, id) {
    for (let i = 0, l = array.length; i < l; ++i) {
        if (array[i].id === id) {
            return true;
        }
    }
}

// TODO clean up!
// TODO remove functionality

// request types:
// add + name + object  ->  node.id > type > "name" + "object"
// add + name           ->  node.id > type > "name"
// set + name + object  ->  node.id > type > "name" + "object"
// set + name           ->  node.id > type > "name"

// HASH > string > ""
function setHash (type, value) {
    // hash value
    // exists logic
    // set type
}

// UID > type > HASH
// UID > type > UID
function setTriple (subject, predicate, object) {
    // check if triple exists
    // set triple
}
function addTriple (subject, predicate, object) {
    // add triple
}

// create HASH > string > ""
// create UID/HASH > name > HASH
// delete HASH (outs, ins)
// delete UID (outs, ins)
//exports.create = (client, type, name, object) => {

//};

//exports.set_name = (client, id, type, name) => {
    // from > edge > to
    // name
//};

//exports.set_object = (client, id, type, name) => {
    // from > edge > to
    // name + object
//};

module.exports = (client, req) => {

    switch (req.mode) {
        case "set":
            // ensure: node > type > hash ..
            console.log('Set ' + req.type + ' "' + req.name + '" on node "' + req.node + '"');
            break;
        case "add":
            // add: node > type > hash
            console.log('Add ' + req.type + ' "' + req.name + '" to node "' + req.node + '"');
            break;
        case "edit":
            // edit node 
            console.log('Change ' + req.type + ' to "' + req.name + '" of node "' + req.node + '"');
            break;
    }

    console.log('Has object:', req.object);

    return; 

    if (triple.length !== 3) {
        return new Error('Flow-api.put: Invalid triple "' + triple.join(', ') + '"');
    }

    const hash = crypto.createHash('md5').update(triple[2]).digest('hex');

    // check if hash exists and get in edges
    client.g.V('_:' + hash).In().GetLimit(1, (err, result) => {

        if (err) {
            return err;
        }

        if (result) {

            // check if hash has in connection not from node.id 
            if (!inArray(result, triple[0])) {

                // get existing name
                client.g.V(triple[0]).Out(SCHEMA + "name>").GetLimit(1, (err, result) => {

                    if (err) {
                        return;
                    }

                    const existingName = result[0].id;

                    client.delete([{
                        subject: triple[0],
                        predicate: SCHEMA + "name>",
                        object: existingName
                    }], (err, body) => {

                        if (err || body.error) {
                            return;
                        }

                        client.write([{
                            subject: triple[0],
                            predicate: SCHEMA + "name>",
                            object: '_:' + hash
                        }], (err, body) => {
                            console.log('Cayley.PUT: Edge added:', err, body)
                        });
                    });
                });
            }

            return;
        }

        // create hash and edge to node.id
        const nameTriples = [

            // id > name > hash 
            {
                subject: triple[0],
                predicate: SCHEMA + "name>",
                object: "_:" + hash
            },
            // hash > string > ""
            {
                subject: "_:" + hash,
                predicate: RDF_SYNTAX + "string>",
                object: triple[2]
            },
            // hash > type > NAME
            {
                subject: "_:" + hash,
                predicate: RDF_SYNTAX + "type>",
                object: FLOW_VOCAB + "Name>"
            }
        ];

        // get existing name
        client.g.V(triple[0]).Out(SCHEMA + "name>").GetLimit(1, (err, result) => {

            if (err) {
                return;
            }

            // TODO change state name results in:
            // TypeError: Cannot read property '0' of null
            // flow-api/lib/cayley_put.js:107
            // const existingName = result[0].id;

            const existingName = result[0].id;
            client.g.V(existingName).In().All((err, body) => {

                if (err || (body && body.error)) {
                    return;
                }

                // remove string if it has no in connections
                if (!body || (body.length === 1 && body[0].id === triple[0])) {
                    // TODO remove string
                    console.log('TODO: remove string:', existingName);
                }

                client.delete([{
                    subject: triple[0],
                    predicate: SCHEMA + "name>",
                    object: existingName
                }], (err, body) => {

                    if (err || body.error) {
                        return;
                    }

                    client.write(nameTriples, (err, body) => {
                        console.log('Cayley.PUT: Name triples added:', err, body)
                    });
                });
            });
        });
    });
};
