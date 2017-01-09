"use strict"

function keepIntegrity (node, type) {
    switch (type) {
        case "entrypoint":
            // remove node, ins and outs (n>ep>e, environments, sequence)
            break;
        case "fn":
        case "state":
        case "environment":
        case "arguments":
            // check ins, if no, remove
            break;
        case "onError":
        case "onEnd":
        case "sequence":
            // remove node, if no ins, remove outs (onErr, onEnd, next, handlers, role)
        case "next":
            // get next of handler, remove handler attacht removed next to subject
            // if no ins in sequence, remove
            
    }
}

// remove connection triple and remove object, but keep integrity to other connections
function removeConnection (client, s, p, o) {
    keepIntegrity(o);
}

function removeEntity (client, id) {
    // remove HASHs and fn (fn, role, state, args, env, name)
}

module.exports = (client, req, callback) => {
    console.log('Delete:', req);
    callback(null, "Not implemented");
};
