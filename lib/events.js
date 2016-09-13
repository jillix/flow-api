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
 * returns an event
 * @name getOne
 *
 */
exports.getOne = function (options, data, next) {
    var options = options || {};
    var instanceName = data.instanceName;
    var eventName = data.eventName;

    if (!instanceName) {
        return next(new ApiError(data.res, 500, 'Missing instance name'));
    }
    if (!eventName) {
        return next(new ApiError(data.res, 500, 'Missing event name'));
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
            ['Has', ['rdf:type', 'flow:ModuleInstanceConfig']],
            ['Out', 'flow:event'],
            ['Has', ['schema:name', eventName]]
        ],
        {
            projections: null
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
 * returns event details in jsonld
 * @name getHandlerDetails
 *
 */
exports.getHandlerDetails = function (options, data, next) {
    var handlerId = data.handlerId;

    if (!handlerId) {
        return next(new ApiError(data.res, 400, 'Missing handler id.'));
    }

    // find the instance module
    jsonldClient.find(
        [ 
            handlerId
        ],
        schema['instance.jsonld'],
        {
            projections: [
                'http://schema.jillix.net/vocab/args',
                'http://schema.jillix.net/vocab/instance',
                'http://schema.jillix.net/vocab/dataHandler',
                'http://schema.jillix.net/vocab/streamHandler',
                'http://schema.jillix.net/vocab/emit',
            ]
        }, function (err, handler) {

        if (err) {
            return next(new ApiError(data.res, 500, err.message));
        }
        if (!handler) {
            return next(new ApiError(data.res, 404, 'not found.'));
        }

        handler['@context'] = [
            'http://schema.jillix.net/context/instance.jsonld'
        ];

        data.body = handler;
        next(null, data);
    });
};