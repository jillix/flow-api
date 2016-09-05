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
                ['flow:event', [
                    'flow:sequence'
                ]]
            ],
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

        if (!graph.length) {
            data.body = graph;
            return next(null, data);
        }

        // get all instance ids and their events
        var instances = {};
        graph.forEach(function (triple) {

            // if predicate is an event then the subject is an instance
            if (triple[1] === 'http://schema.jillix.net/vocab/event') {
                instances[triple[0]] = instances[triple[0]] || {};
                instances[triple[0]].events = instances[triple[0]].events || [];
                instances[triple[0]].events.push(triple[2]);
            }
        });

        // for every instance go through all of its events and find a walk to other instances
        Object.keys(instances).forEach(function (instanceIRI) {
            var instance = instances[instanceIRI];
            instance.links = [];

            // go through every event and travers its sequence
            instance.events.forEach(function (event) {

                // find the sequence of the event
                var sequenceNode = null;
                graph.forEach(function (triple) {

                    if (triple[0] === event && triple[1] === 'http://schema.jillix.net/vocab/sequence') {
                        sequenceNode = triple[2];
                    }
                });

                if (!sequenceNode) {
                    return;
                }

                // go to the end of the sequence
                var sequenceEnd = false;
                while (!sequenceEnd) {
                    var nextSequence = null;

                    graph.forEach(function (triple) {

                        // select the sequence related triples
                        if (triple[0] === sequenceNode) {

                            switch (triple[1]) {
                                case 'http://schema.jillix.net/vocab/instance':
                                    var linkIri = triple[2];

                                    if (linkIri !== instanceIRI && instance.links.indexOf(linkIri) < 0) {
                                        instance.links.push(linkIri);
                                    }

                                    break
                                case 'http://schema.jillix.net/vocab/emit':
                                    var linkIri = triple[2].substring(0, triple[2].indexOf('/event/'));

                                    if (linkIri !== instanceIRI && instance.links.indexOf(linkIri) < 0) {
                                        instance.links.push(linkIri);
                                    }

                                    break;
                                case 'http://schema.jillix.net/vocab/sequence':
                                    nextSequence = triple[2];
                                    break;
                                default:
                                    return;
                            }
                        }
                    });

                    if (!nextSequence) {
                        sequenceEnd = true;
                    } else {
                        sequenceNode = nextSequence;
                    }
                }
            });
        });

        // build final triples
        var triples = [];
        Object.keys(instances).forEach(function (instanceIRI) {
            var instance = instances[instanceIRI];

            instance.links.forEach(function (linkIri) {
                triples.push([
                    instanceIRI,
                    'flow:link',
                    linkIri
                ]);
            });
        });

        data.body = triples;
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