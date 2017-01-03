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
// TODO update objects
// TODO add UID (ink. HASH)
// TODO remove UID (sequence, handler, etc.), HASH (state, args, env)

exports.put = (client, triple) => {

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
