"use strict"

const remove = require('./lib/remove');
const create = require('./lib/create');
const update = require('./lib/update');
const validate = require('./lib/validation');

exports.search = () => {};

exports.sequence = (store, node, role) => {

    if (!validate.blankNode([node, role])) {
        return new Error('Flow-api.sequence: Invalid node id.');
    }

    return store.sequence(node, role);
};

exports.getOutNodes = (store, node, out) => {

    if (!validate.blankNode(node)) {
        return new Error('Flow-api.getOutNodes: Invalid node id.');
    }

    if (!validate.getEdge(out)) {
        return new Error('Flow-api.getOutNodes: Invalid predicate.');
    }

    return store.outNodes(node, out);
};

exports.getNodeData = (store, node) => {

    if (!validate.blankNode(node)) {
        return new Error('Flow-api.getNodeData: Invalid node id.');
    }

    return store.getObject(node);
};

exports.getNodeName = (store, node) => {

    if (!validate.blankNode(node)) {
        return new Error('Flow-api.getOutNodes: Invalid node id.');
    }

    return store.getName(node);
};

exports.setNodeData = (store, node, data) => {

    if (!validate.blankNode(node)) {
        return new Error('Flow-api.setNodeData: Invalid node id.');
    }

    if (!validate.data(data)) {
        return new Error('Flow-api.setNodeData: Invalid data.');
    }

    return update.data(store, node, data);
};

exports.setNodeName = (store, node, name) => {

    if (!validate.blankNode(node)) {
        return new Error('Flow-api.setNodeName: Invalid node id.');
    }

    if (!validate.name('set', name)) {
        return new Error('Flow-api.setNodeName: Invalid name.');
    }

    return update.name(store, node, name);
};

exports.addOutNode = (store, add, out, node) => {

    if (!validate.blankNode([add, node])) {
        return new Error('Flow-api.addOutNode: Invalid node id.');
    }

    if (!validate.addEdge(out)) {
        return new Error('Flow-api.addOutNode: Invalid predicate.');
    }

    return create.out(store, add, out, node);
};

exports.addOutCreate = (store, add, out, node) => {

    if (!validate.blankNode(add)) {
        return new Error('Flow-api.addOutCreate: Invalid node id.');
    }

    if (!validate.addEdge(out)) {
        return new Error('Flow-api.addOutCreate: Invalid predicate.');
    }

    if (!validate.data(node)) {
        return new Error('Flow-api.addOutCreate: Invalid data.');
    }

    return create.out(store, add, out, create.node(node));
};

exports.setOutNode = (store, set, out, node) => {

    if (!validate.blankNode([set, node])) {
        return new Error('Flow-api.setOutNode: Invalid node id.');
    }

    if (!validate.setEdge(out)) {
        return new Error('Flow-api.setOutNode: Invalid predicate.');
    }

    update.out(store, set, out, node);
};

exports.setOutCreate = (store, set, out, node) => {

    if (!validate.blankNode(set)) {
        return new Error('Flow-api.setOutCreate: Invalid node id.');
    }

    if (!validate.setEdge(out)) {
        return new Error('Flow-api.setOutCreate: Invalid predicate.');
    }

    if (!validate.data(node)) {
        return new Error('Flow-api.setOutCreate: Invalid data.');
    }

    update.out(store, set, out, create.node(node));
};

exports.removeNode = (store, node) => {

    if (!validate.blankNode(node)) {
        return new Error('Flow-api.removeNode: Invalid node id.');
    }

    return remove.node(store, node);
};

exports.removeOut = (store, node, out) => {

    if (!validate.blankNode(node)) {
        return new Error('Flow-api.removeOut: Invalid node id.');
    }

    if (!validate.delEdge(out)) {
        return new Error('Flow-api.removeOut: Invalid predicate.');
    }

    return remove.out(store, node, out);
};
