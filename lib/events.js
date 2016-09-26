/**
 * mic related data handlers
 * @module mic
 */

// Dependencies
var cayley = require('cayley')
  , client = cayley("http://localhost:64210/")
  , cayleyJsonldIO = require('cayley-jsonld-io')
  , jsonldClient = new cayleyJsonldIO.Client({
        url: 'http://localhost:64210'
    })
  , ApiError = require('./error')
  , schema = require('schema').schemas
  , N3 = require('n3')
  , N3Util = N3.Util;

// RDF constants
var RDF_TYPE = 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type';
var FLOW = 'http://schema.jillix.net/vocab/';
var SCHEMA = 'http://schema.org/';

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

    // query cayley to get event
    var graph = client.graph;
    graph.V().Has(
        RDF_TYPE,
        FLOW + 'ModuleInstanceConfig'
    ).Has(
        SCHEMA + 'name',
        N3Util.createLiteral(instanceName)
    ).Out(
        FLOW + 'event'
    ).Has(
        SCHEMA + 'name',
        N3Util.createLiteral(eventName)
    ).Tag('subject').Out(null, 'predicate').All(function (err, triples) {

        if (err) {
            return next(new ApiError(data.res, 500, err.message));
        }
        if (!triples) {
            data.body = [];
            return next(null, data);
        }

        // add triples tp response body
        data.body = [];
        triples.forEach(function (triple) {
            data.body.push([
                triple.subject,
                triple.predicate,
                triple.id
            ]);
        });

        var event_iri = data.body[0][0];

        // get sequences
        graph.V().Has(
            FLOW + 'event',
            event_iri
        ).Has(
            RDF_TYPE,
            FLOW + 'Sequence'
        ).Tag('subject').Out(null, 'predicate').All(function (err, triples) {

            if (err) {
                return next(new ApiError(data.res, 500, err.message));
            }
            if (!triples) {
                return next(null, data);
            }

            // add triples tp response body
            triples.forEach(function (triple) {
                data.body.push([
                    triple.subject,
                    triple.predicate,
                    triple.id
                ]);
            });

            return next(null, data);
        });
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