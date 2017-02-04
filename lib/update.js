"use strict"

// UPDATE

exports.data = (store, node, data) => {
    // node must exists..
    store.getObject(node);
    // get data, compare with hash
    // exists and different:
    // - remove hash and add new data triples
    // doesnt exists:
    // - add new data triples
    // exists and equal:
    // - ignore
};
exports.name = (store, node, name) => {
    store.getName(node);
};
exports.out = (store, set, out, node) => {
    // set node delete previous
};
