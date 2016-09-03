/**
 * mic related data handlers
 * @module mic
 */

// Dependencies
var cayleyIO = require('cayley-triple-io')
  , cayleyClient = new cayleyIO.Client({
        url: 'http://localhost:64210',
        prefixes: {
            flow: 'http://schema.jillix.net/vocab/',
            schema: 'http://schema.org/'
        }
    });

exports.get = function (options, data, next) {};