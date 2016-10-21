// Dependencies
var cayley = require('./cayley')
  , cayleyJsonldIO = require('cayley-jsonld-io')
  , jsonldClient = new cayleyJsonldIO.Client({
        url: 'http://localhost:64210'
    })
  , ApiError = require('./error')
  , schema = require('schema').schemas;

// RDF constants
var RDF_TYPE = 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type';
var FLOW = 'http://schema.jillix.net/vocab/';
var SCHEMA = 'http://schema.org/';

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
    cayley.getInstances(function (err, instancesTriples) {

        if (err) {
            return next(new ApiError(data.res, 500, err.message));
        }

        data.result = instancesTriples;

        return next(null, data);
    });
};

/*
 *
 * Creates an instance
 * @name create
 *
 */
exports.create = function (options, data, next) {
    var options = options || {};
    var body = data.body || {};

    jsonldClient.insert(body, function (err, result) {

        if (err) {
            return next(new ApiError(data.res, 500, err.message));
        }

        // query cayley for instances
        cayley.getIri(body['@id'], function (err, instancesTriples) {

            if (err) {
                return next(new ApiError(data.res, 500, err.message));
            }

            data.body = instancesTriples;
            return next(null, data);
        });
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
        return next(new ApiError(data.res, 400, 'Missing instance name.'));
    }

    // build the projections
    // TODO
    var filter = data.filter || '';
    filter = filter.split(',').filter(Boolean);

    cayley.getInstance(instanceName, function (err, instancesTriples) {

        if (err) {
            return next(new ApiError(data.res, 500, err.message));
        }

        data.result = instancesTriples;
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
            return next(new ApiError(data.res, 404, 'Instance not found.'));
        }

        // parse the instance arguments
        if (instance.args && typeof instance.args === 'string') {
            try {
                instance.args = JSON.parse(instance.args);
            } catch (e) {
                instance.args = null;
            }
        }

        instance['@context'] = 'http://schema.jillix.net/context/instance.jsonld'

        data.body = instance;
        next(null, data);
    });
};
