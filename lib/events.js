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
 * Creates an event
 * @name create
 *
 */
exports.create = function (options, data, next) {
    var options = options || {};
    var body = data.body || {};

    if (!data.instanceName) {
        return next(new ApiError(data.res, 400, 'Missing instance name.'));
    }

    // get instance
    var graph = client.graph;
    graph.V().Has(
        RDF_TYPE,
        FLOW + 'ModuleInstanceConfig'
    ).Has(
        SCHEMA + 'name',
        N3Util.createLiteral(data.instanceName)
    ).Tag('subject').Out(
        SCHEMA + 'name'
    , 'predicate').All(function (err, triples) {

        if (err) {
            return next(new ApiError(data.res, 500, err.message));
        }
        if (!triples) {
            data.body = [];
            return next(new ApiError(data.res, 404, 'Instance not found'));
        }
        var instance = triples[0].subject;
        var event = body['@id'];

        // event must not already exist
        graph.V(event).All(function (err, triples) {

            if (err) {
                return next(new ApiError(data.res, 500, err.message));
            }
            if (triples && triples.length) {
                return next(new ApiError(data.res, 400, 'Event already exists'));   
            }

            // add event
            jsonldClient.insert(body, function (err, result) {

                if (err) {
                    return next(new ApiError(data.res, 500, err.message));
                }

                // add link from instance to event
                var link = [
                    {
                        subject: instance,
                        predicate: FLOW + 'event',
                        object: event
                    }
                ];
                client.write(link, function (err, result) {

                    if (err) {
                        return next(new ApiError(data.res, 500, err.message));
                    }

                    data.body = [
                        [
                            instance,
                            FLOW + 'event',
                            event
                        ]
                    ];
                    return next(null, data);
                });
            });
        });
    });
};

/*
 *
 * adds end to event
 * @name addEnd
 *
 */
exports.addEnd = function (options, data, next) {
    var options = options || {};
    var body = data.body || {};

    if (!data.instanceName) {
        return next(new ApiError(data.res, 400, 'Missing instance name.'));
    }
    if (!data.eventName) {
        return next(new ApiError(data.res, 400, 'Missing event name.'));
    }

    // query cayley to get event
    var graph = client.graph;
    graph.V().Has(
        RDF_TYPE,
        FLOW + 'ModuleInstanceConfig'
    ).Has(
        SCHEMA + 'name',
        N3Util.createLiteral(data.instanceName)
    ).Out(
        FLOW + 'event'
    ).Has(
        SCHEMA + 'name',
        N3Util.createLiteral(data.eventName)
    ).Tag('subject').Out(null, 'predicate').All(function (err, triples) {

        if (err) {
            return next(new ApiError(data.res, 500, err.message));
        }
        if (!triples) {
            return next(new ApiError(data.res, 404, 'Event not found.'));
        }
        var event = triples[0].subject;

        // check if event already has end listener
        for (var i = 0; i < triples.length; ++i) {
            if (triples[i].predicate === FLOW + 'onEnd') {
                return next(new ApiError(data.res, 400, 'Event already has end listener.'));
            }
        }

        // listener event must exist
        graph.V(body.onEnd).All(function (err, res) {

            if (err) {
                return next(new ApiError(data.res, 500, err.message));
            }
            if (!res || !res.length) {
                return next(new ApiError(data.res, 404, 'End event not found.'));
            }

            // add link from event to listener
            var link = [
                {
                    subject: event,
                    predicate: FLOW + 'onEnd',
                    object: body.onEnd
                }
            ];
            client.write(link, function (err, result) {

                if (err) {
                    return next(new ApiError(data.res, 500, err.message));
                }

                data.body = [
                    [
                        event,
                        FLOW + 'onEnd',
                        body.onEnd
                    ]
                ];

                return next(null, data);
            });
        });
    });
};

/*
 *
 * adds error to event
 * @name addError
 *
 */
exports.addError = function (options, data, next) {
    var options = options || {};
    var body = data.body || {};

    if (!data.instanceName) {
        return next(new ApiError(data.res, 400, 'Missing instance name.'));
    }
    if (!data.eventName) {
        return next(new ApiError(data.res, 400, 'Missing event name.'));
    }

    // query cayley to get event
    var graph = client.graph;
    graph.V().Has(
        RDF_TYPE,
        FLOW + 'ModuleInstanceConfig'
    ).Has(
        SCHEMA + 'name',
        N3Util.createLiteral(data.instanceName)
    ).Out(
        FLOW + 'event'
    ).Has(
        SCHEMA + 'name',
        N3Util.createLiteral(data.eventName)
    ).Tag('subject').Out(null, 'predicate').All(function (err, triples) {

        if (err) {
            return next(new ApiError(data.res, 500, err.message));
        }
        if (!triples) {
            return next(new ApiError(data.res, 404, 'Event not found.'));
        }
        var event = triples[0].subject;

        // check if event already has end listener
        for (var i = 0; i < triples.length; ++i) {
            if (triples[i].predicate === FLOW + 'onError') {
                return next(new ApiError(data.res, 400, 'Event already has end listener.'));
            }
        }

        // listener event must exist
        graph.V(body.onError).All(function (err, res) {

            if (err) {
                return next(new ApiError(data.res, 500, err.message));
            }
            if (!res || !res.length) {
                return next(new ApiError(data.res, 404, 'End event not found.'));
            }

            // add link from event to listener
            var link = [
                {
                    subject: event,
                    predicate: FLOW + 'onError',
                    object: body.onError
                }
            ];
            client.write(link, function (err, result) {

                if (err) {
                    return next(new ApiError(data.res, 500, err.message));
                }

                data.body = [
                    [
                        event,
                        FLOW + 'onError',
                        body.onError
                    ]
                ];
                
                return next(null, data);
            });
        });
    });
};

/*
 *
 * adds sequence to event
 * @name addSequence
 *
 */
exports.addSequence = function (options, data, next) {
    var options = options || {};
    var body = data.body || {};

    if (!data.instanceName) {
        return next(new ApiError(data.res, 400, 'Missing instance name.'));
    }
    if (!data.eventName) {
        return next(new ApiError(data.res, 400, 'Missing event name.'));
    }

    // init variable to be used for linking
    var event, instance, sequenceInstance, sequenceParent;

    // Make sure the event exists
    getEvent(data.instanceName, data.eventName, function (err, eventTriples) {

        if (err) {
            return next(new ApiError(data.res, 500, err.message));
        }
        if (!eventTriples.length) {
            return next(new ApiError(data.res, 404, 'Event not found.'));
        }
        event = eventTriples[0][0];
        instance = event.substring(0, event.lastIndexOf('/')); // extract instance iri from event

        // Make sure the instance used in the sequence exists
        getIri(body.instance, function (err, sequenceInstanceTriples) {

            if (err) {
                return next(new ApiError(data.res, 500, err.message));
            }
            if (!sequenceInstanceTriples.length) {
                return next(new ApiError(data.res, 404, 'Sequence instance not found.'));
            }
            sequenceInstance = sequenceInstanceTriples[0][0];


            // if sequence is of type EventEmit make sure the event emited exists
            if (body.emit !== 'undefined') {
                getIri(body.emit, function (err, emitTriples) {

                    if (err) {
                        return next(new ApiError(data.res, 500, err.message));
                    }
                    if (!emitTriples.length) {
                        return next(new ApiError(data.res, 404, 'Emit event not found.'));
                    }

                    findSequenceParent();
                });
            } else {
                findSequenceParent();
            }
        });
    });
    
    function findSequenceParent () {
        // compute which node will be the parent of the sequence
        getEventSequences(event, function (err, sequencesTriples) {

            if (err) {
                return next(new ApiError(data.res, 500, err.message));
            }
            if (!sequencesTriples.length) {
                sequenceParent = event;
                return insertSequence();
            }

            var sequences = {};
            sequencesTriples.forEach(function (triple) {

                if (triple[1] === RDF_TYPE && triple[2] === (FLOW + 'Sequence')) {
                    sequences[triple[0]] = sequences[triple[0]] || false;
                }
                if (triple[1] === (FLOW + 'sequence')) {
                    sequences[triple[0]] = true;   
                }
            });
            Object.keys(sequences).forEach(function (sequenceIri) {

                if (!sequences[sequenceIri]) {
                    sequenceParent = sequenceIri;
                }
            });

            if (!sequenceParent) {
                return next(new ApiError(data.res, 500, 'Could not compute the sequence parent.'));
            }

            insertSequence();
        });
    }

    function insertSequence () {
        body.event = event; // add the event the sequence belongs to
        // temporary context fix
        body['@context'] = schema['instance.jsonld']['@context'];
        jsonldClient.insert(body, function (err, sequence) {

            if (err) {
                return next(new ApiError(data.res, 500, err.message));
            }

            addLinks(sequence);
        });
    }

    function addLinks (sequence) {

        // add the sequence link
        addEdge(sequenceParent, FLOW + 'sequence', sequence['@id'], function (err) {

            if (err) {
                return next(new ApiError(data.res, 500, err.message));
            }

            // prepare to add dependency links
            if (sequenceInstance === instance) { // do not add dependency if sequence uses its own instance
                return finish();
            }

            // do not add dependency if it already exists
            var graph = client.graph;
            graph.V(instance).Has(
                FLOW + 'dependency',
                sequenceInstance
            ).All(function (err, res) {

                if (err) {
                    return next(new ApiError(data.res, 500, err.message));
                }
                if (res && res.length > 0) { // dependency already exists
                    return finish();
                }

                // add dependency
                addEdge(instance, FLOW + 'dependency', sequenceInstance, function (err) {

                    if (err) {
                        return next(new ApiError(data.res, 500, err.message));
                    }

                    finish();
                });
            });
        });

        function finish () {
            // generate the result
            getIri(sequence['@id'], function (err, sequenceTriples) {

                if (err) {
                    return next(new ApiError(data.res, 500, err.message));
                }
                if (!sequenceTriples.length) {
                    return next(new ApiError(data.res, 500, 'Sequence could not be inserted'));
                }

                var result = [
                    [
                        sequenceParent,
                        FLOW + 'sequence',
                        sequence['@id']
                    ]
                ];
                result = result.concat(sequenceTriples);
                data.body = result;
                return next(null, data);
            });
        }
    }
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

function getEvent (instanceName, eventName, callback) {

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

function getIri(iri, callback) {

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

function getEventSequences(eventIri, callback) {

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

function addEdge(subject, predicate, object, callback) {

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