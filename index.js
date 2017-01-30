"use strict"

const remove = require('./remove');
const create = require('./create');
const update = require('./update');

exports._networks = (store, user) => {
    store.networks(user);
};

exports.sequence = (store, node, role) => {
    store.sequence(node, role);
};

exports.getOutNodes = (store, out) => { 
    store.outNodes(node, out);
};

exports.getNodeData = (store, node) => { 
    store.getObject(node);
};

exports.getNodeName = (store, node) => { 
    store.getName(node);
};

exports.setNodeData = (store, node, data) => {
    update.data(store, node, data);
};

exports.setNodeName = (store, node, name) => { 
    update.name(store, node, name);
};

exports.addOutNode = (store, add, out, node) => {
    // create.out(store, add, out, node);
};

exports.addOutCreate = (store, add, out, create) => {
    // create.out(store, add, out, create.node(create));
};

exports.setOutNode = (store, set, out, node) => {
    update.out(store, set, out, node);
};

exports.setOutCreate = (store, set, out, create) => {
    update.out(store, set, out, create.node(create));
};

exports.removeNode = (store, node) => {
    // remove.node(store, node);
};

exports.removeOut = (store, node, out) => {
    // remove.out(store, node, out);
};
