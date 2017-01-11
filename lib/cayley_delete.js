"use strict"

const Network = require('./network');

// TODO check handler remove ensure next connection
// get next of handler, remove handler attacht removed next to subject
// if no ins in sequence, remove

module.exports = (client, req, callback) => {

    switch (req.mode) {
        case "node":

            // get ins and outs of node
            Network.removeNodes(client, null, [req.node], (err, result) => {

                if (err) {
                    return callback(err);
                }

                console.log('Remove node:', err, result);
                Network.remove(client, result, callback);
                callback();
            });

            break;
        case "edge":
            Network.removeOut(client, [req.node], [req.data], (err, result) => {

                if (err) {
                    return callback(err);
                }

                console.log('Remove edge:', err, result);
                Network.remove(client, result, callback);
                callback();
            });
            break;
    }
};
