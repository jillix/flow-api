"use strict"

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
