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
            schema: 'http://schema.org/',
            rdf: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#'
        }
    })
  , ApiError = require('./error');

/*
 *
 * returns all instances
 * @name getInstances
 *
 */
exports.getInstances = function (options, data, next) {
    var options = options || {};

    // create read stream
    var stream = cayleyClient.createReadStream(
        [
            'flow:ModuleInstanceConfig',
            ['In', 'rdf:type']
        ],
        {
            projections: [
                'schema:name'
            ]
        }
    );

    graph = [];
    stream.on('data', function (chunk) {
        graph.push(chunk);
    });

    var error = false;
    stream.on('error', function (err) {
        error = true;
        return next(new ApiError(data.res, 500, err.message));
    });

    stream.on('end', function () {

        if (error) {
            return;
        }

        data.body = graph;
        return next(null, data);
    });
};

/*
 *
 * returns an instance
 * @name getInstance
 *
 */
exports.getInstance = function (options, data, next) {
    var options = options || {};
    var instanceName = data.instanceName;

    if (!instanceName) {
        return next(new ApiError(data.res, 500, 'Missing instance name'));
    }

    // create read stream
    var stream = cayleyClient.createReadStream(
        [
            instanceName,
            ['In', 'schema:name'],
            ['Has', ['rdf:type', 'flow:ModuleInstanceConfig']]
        ],
        {
            projections: [
                'flow:module',
                'flow:event',
            ]
        }
    );

    graph = [];
    stream.on('data', function (chunk) {
        graph.push(chunk);
    });

    var error = false;
    stream.on('error', function (err) {
        error = true;
        return next(new ApiError(data.res, 500, err.message));
    });

    stream.on('end', function () {

        if (error) {
            return;
        }

        data.body = graph;
        return next(null, data);
    });
};

/*
 *
 * returns an event
 * @name getEvent
 *
 */
exports.getEvent = function (options, data, next) {
    var options = options || {};
    var instanceName = data.instanceName;
    var eventName = data.eventName;

    if (!instanceName) {
        return next(new ApiError(data.res, 500, 'Missing instance name'));
    }
    if (!eventName) {
        return next(new ApiError(data.res, 500, 'Missing event name'));
    }

    // create read stream
    var stream = cayleyClient.createReadStream(
        [
            instanceName,
            ['In', 'schema:name'],
            ['Has', ['rdf:type', 'flow:ModuleInstanceConfig']],
            ['Out', 'flow:event'],
            ['Has', ['schema:name', eventName]]
        ],
        {
            projections: [
                'flow:sequence'
            ]
        }
    );

    graph = [];
    stream.on('data', function (chunk) {
        graph.push(chunk);
    });

    var error = false;
    stream.on('error', function (err) {
        error = true;
        return next(new ApiError(data.res, 500, err.message));
    });

    stream.on('end', function () {

        if (error) {
            return;
        }

        data.body = graph;
        return next(null, data);
    });
};

/*
 *
 * returns all modules
 * @name getModules
 *
 */
exports.getModules = function (options, data, next) {};

/*
 *
 * returns a module
 * @name getModule
 *
 */
exports.getModule = function (options, data, next) {};