"use strict"

const availableStores = {
    cayley: "./stores/cayley/"
};

module.exports = (config) => {

    if (!availableStores[config.store]) {
        throw new Error('Flow-Api: Store "' + config.store + '" not available.');
    }

    const store = require(availableStores[config.store]);

    if (typeof store !== 'function') {
        throw new Error('Flow-Api: Invalid store adpater: ' + config.store);
    }

    return store(config.config);
};
