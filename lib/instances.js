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
  , cayleyJsonldIO = require('cayley-jsonld-io')
  , jsonldClient = new cayleyJsonldIO.Client({
        url: 'http://localhost:64210'
    })
  , ApiError = require('./error')
  , schema = require('schema').schemas;

/*
 *
 * returns all instances
 * @name get
 *
 */
exports.get = function (options, data, next) {
    var options = options || {};

    // build the projections
    // TODO
    var filter = data.filter || '';
    filter = filter.split(',').filter(Boolean);

    // create read stream
    var stream = cayleyClient.createReadStream(
        [
            'flow:ModuleInstanceConfig',
            ['In', 'rdf:type']
        ],
        {
            projections: [
                'schema:name',
                'flow:dependency'
            ]
        }
    );

    var graph = [];
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
 * @name getOne
 *
 */
exports.getOne = function (options, data, next) {
    var options = options || {};
    var instanceName = data.instanceName;

    if (!instanceName) {
        return next(new ApiError(data.res, 400, 'Missing instance name'));
    }

    // build the projections
    // TODO
    var filter = data.filter || '';
    filter = filter.split(',').filter(Boolean);

    // create read stream
    var stream = cayleyClient.createReadStream(
        [
            instanceName,
            ['In', 'schema:name'],
            ['Has', ['rdf:type', 'flow:ModuleInstanceConfig']]
        ],
        {
            projections: null,
            out: [
                'flow:event'
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
 * returns instance details in jsonld
 * @name getDetails
 *
 */
exports.getDetails = function (options, data, next) {
    var instanceName = data.instanceName;

    if (!instanceName) {
        return next(new ApiError(data.res, 400, 'Missing instance name.'));
    }

    // find the instance module
    jsonldClient.find(
        [ 
            instanceName,
            ['In', 'http://schema.org/name', true],
            ['Has', ['http://www.w3.org/1999/02/22-rdf-syntax-ns#type', 'http://schema.jillix.net/vocab/ModuleInstanceConfig'], true]
        ],
        schema['instance.jsonld'],
        {
            projections: [
                'http://schema.jillix.net/vocab/module',
                'http://schema.jillix.net/vocab/roles',
                'http://schema.jillix.net/vocab/args',
                'http://schema.org/name'
            ]
        }, function (err, instance) {

        if (err) {
            return next(new ApiError(data.res, 500, err.message));
        }
        if (!instance) {
            return next(new ApiError(data.res, 404, 'not found.'));
        }

        instance['@context'] = [
            'http://schema.jillix.net/context/instance.jsonld',
            instance.module
        ];

        data.body = instance;
        next(null, data);
    });
};