// Dependencies
var cayley = require('cayley')
  , client = cayley("http://localhost:64210/")
  , schema = require('schema').schemas
  , N3 = require('n3')
  , N3Util = N3.Util;

// RDF constants
var RDF_TYPE = 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type';
var FLOW = 'http://schema.jillix.net/vocab/';
var SCHEMA = 'http://schema.org/';

exports.client = client;

/*
 *
 * returns all instances triples
 * @name getInstances
 *
 */
exports.getInstances = function (callback) {

    var graph = client.graph;
    graph.V().Has(
        RDF_TYPE,
        FLOW + 'ModuleInstanceConfig'
    ).Tag('subject').Out([
        SCHEMA + 'name',
        FLOW + 'dependency'
    ], 'predicate').All(function (err, res) {

        if (err) {
            return callback(err);
        }
        if (!res || !res.length) {
            return callback(null, []);
        }

        var triples = [];
        res.forEach(function (triple) {
            triples.push([
                triple.subject,
                triple.predicate,
                triple.id
            ]);
        });

        callback(null, triples);
    });
}

/*
 *
 * returns the triples of an instance
 * @name getInstances
 *
 */
exports.getInstance = function (instanceName, callback) {

    var graph = client.graph;
    graph.V().Has(
        RDF_TYPE,
        FLOW + 'ModuleInstanceConfig'
    ).Has(
        SCHEMA + 'name',
        N3Util.createLiteral(instanceName)
    ).Tag('subject').Out(null, 'predicate').All(function (err, res) {

        if (err) {
            return callback(err);
        }
        if (!res || !res.length) {
            return callback(null, []);
        }

        var triples = [];
        res.forEach(function (triple) {
            triples.push([
                triple.subject,
                triple.predicate,
                triple.id
            ]);
        });

        callback(null, triples);
    });
}

/*
 *
 * returns the triples of an event
 * @name getEvent
 *
 */
exports.getEvent = function (instanceName, eventName, callback) {

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
    ).Tag('subject').Out(null, 'predicate').All(function (err, res) {

        if (err) {
            return callback(err);
        }
        if (!res || !res.length) {
            return callback(null, []);
        }

        var triples = [];
        res.forEach(function (triple) {
            triples.push([
                triple.subject,
                triple.predicate,
                triple.id
            ]);
        });

        callback(null, triples);
    });
}

/*
 *
 * returns all outgoing edges of a given iri
 * @name getIri
 *
 */
exports.getIri = function(iri, callback) {

    var graph = client.graph;
    graph.V(iri).Tag('subject').Out(null, 'predicate').All(function (err, res) {

        if (err) {
            return callback(err);
        }
        if (!res || !res.length) {
            return callback(null, []);
        }

        var triples = [];
        res.forEach(function (triple) {
            triples.push([
                triple.subject,
                triple.predicate,
                triple.id
            ]);
        });

        callback(null, triples);
    });
}

/*
 *
 * returns all sequence triples of an event
 * @name getEventSequences
 *
 */
exports.getEventSequences = function(eventIri, callback) {

    var graph = client.graph;
    graph.V().Has(
        FLOW + 'event',
        eventIri
    ).Has(
        RDF_TYPE,
        FLOW + 'Sequence'
    ).Tag('subject').Out(null, 'predicate').All(function (err, res) {

        if (err) {
            return callback(err);
        }
        if (!res || !res.length) {
            return callback(null, []);
        }

        var triples = [];
        res.forEach(function (triple) {
            triples.push([
                triple.subject,
                triple.predicate,
                triple.id
            ]);
        });

        callback(null, triples);
    });
}

/*
 *
 * creates an edge
 * @name addEdge
 *
 */
exports.addEdge = function(subject, predicate, object, callback) {

    var triples = [
        {
            subject: subject,
            predicate: predicate,
            object: object
        }
    ];
    client.write(triples, function (err, result) {

        if (err) {
            return callback(err);
        }

        return callback(null, result);
    });
}