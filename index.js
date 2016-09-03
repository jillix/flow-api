// Dependencies
var SetOrGet = require('set-or-get')
  , IterateObject = require('iterate-object')
  , Handlers = require('./lib');

module.exports = {};

/**
 * Main init function
 *
 * @private
*/
module.exports.init = function (config, ready) {

    ready();
}

/**
 * Generate a wrapper for the appended data handler
 *
 * @private
*/
function generateMethod (prefix, handler) {
    return function () {

        // get function arguments
        var args = arguments;

        /* Do custom stuff here before the handler is called
         * ...
        */

        // check if 
        handler.apply(this, args);
    }
}

/**
 * Append the available data handlers to the module.exports object
 *
 * @private
*/
function appendDataHandlers (object, parent, prefix) {
    IterateObject(object, function (handler, name) {
        var cPref = prefix ? prefix + '.' + name : name;
        if (typeof handler === 'object') {
            return appendDataHandlers(handler, SetOrGet(parent, name, {}), cPref);
        }
        parent[name] = generateMethod(cPref, handler);
    });
}

// start appending the data handlers
appendDataHandlers(Handlers, module.exports, '');