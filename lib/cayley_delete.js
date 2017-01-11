"use strict"

const Network = require('./network');

module.exports = (client, req, callback) => {

    switch (req.mode) {
        case "node":

            // get ins and outs of node
            Network.removeNodes(client, null, [req.node], (err, result) => {

                if (err) {
                    return callback(err);
                }

                //console.log('Remove node:', err, result);
                Network.remove(client, result, callback);
                callback();
            });

            break;
        case "edge":
            Network.removeOut(client, [req.node], [req.data], (err, result) => {

                if (err) {
                    return callback(err);
                }

                //console.log('Remove edge:', err, result);
                Network.remove(client, result, callback);
                callback();
            });
            break;
    }
};
