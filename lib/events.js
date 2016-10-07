/**
 * mic related data handlers
 * @module mic
 */

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

    // TODO build projections

    cayley.getEvent(instanceName, eventName, function (err, eventTriples) {

        if (err) {
            return next(new ApiError(data.res, 500, err.message));
        }
        if (!eventTriples.length) {
            return next(new ApiError(data.res, 404, 'Event not found.'));
        }
        var event = eventTriples[0][0];
        data.body = eventTriples;

        cayley.getEventSequences(event, function (err, sequencesTriples) {

            if (err) {
                return next(new ApiError(data.res, 500, err.message));
            }
            if (!sequencesTriples.length) {
                return next(null, data);
            }

            // add sequence triples to response
            sequencesTriples.forEach(function (triple) {
                data.body.push(triple);
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

    var event = body['@id'];
    var instance = event.substring(0, event.lastIndexOf('/'));

    // make sure the instance exists
    cayley.getIri(instance, function (err, instanceTriples) {

        if (err) {
            return next(new ApiError(data.res, 500, err.message));
        }
        if (!instanceTriples.length) {
            return next(new ApiError(data.res, 404, 'Instance not found.'));
        }

        // event must not already exist
        cayley.getIri(event, function (err, eventTriples) {

            if (err) {
                return next(new ApiError(data.res, 500, err.message));
            }
            if (eventTriples && eventTriples.length) {
                return next(new ApiError(data.res, 400, 'Event already exists.'));
            }

            // add event
            jsonldClient.insert(body, function (err, result) {

                if (err) {
                    return next(new ApiError(data.res, 500, err.message));
                }

                // add event edge
                cayley.addEdge(instance, FLOW + 'event', event, function (err) {

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

    cayley.getEvent(data.instanceName, data.eventName, function (err, eventTriples) {

        if (err) {
            return next(new ApiError(data.res, 500, err.message));
        }
        if (!eventTriples.length) {
            return next(new ApiError(data.res, 404, 'Event not found.'));
        }
        var event = eventTriples[0][0];

        // check if event already has end listener
        for (var i = 0; i < eventTriples.length; ++i) {
            if (eventTriples[i][1] === FLOW + 'onEnd') {
                return next(new ApiError(data.res, 400, 'Event already has end listener.'));
            }
        }

        // listener event must exist
        cayley.getIri(body.onEnd, function (err, res) {

            if (err) {
                return next(new ApiError(data.res, 500, err.message));
            }
            if (!res.length) {
                return next(new ApiError(data.res, 404, 'End event not found.'));
            }

            // add edge from event to listener
            cayley.addEdge(event, FLOW + 'onEnd', body.onEnd, function (err) {

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

    cayley.getEvent(data.instanceName, data.eventName, function (err, eventTriples) {

        if (err) {
            return next(new ApiError(data.res, 500, err.message));
        }
        if (!eventTriples.length) {
            return next(new ApiError(data.res, 404, 'Event not found.'));
        }
        var event = eventTriples[0][0];

        // check if event already has error listener
        for (var i = 0; i < eventTriples.length; ++i) {
            if (eventTriples[i][1] === FLOW + 'onError') {
                return next(new ApiError(data.res, 400, 'Event already has an error listener.'));
            }
        }

        // listener event must exist
        cayley.getIri(body.onError, function (err, res) {

            if (err) {
                return next(new ApiError(data.res, 500, err.message));
            }
            if (!res.length) {
                return next(new ApiError(data.res, 404, 'End event not found.'));
            }

            // add edge from event to listener
            cayley.addEdge(event, FLOW + 'onError', body.onError, function (err) {

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
    cayley.getEvent(data.instanceName, data.eventName, function (err, eventTriples) {

        if (err) {
            return next(new ApiError(data.res, 500, err.message));
        }
        if (!eventTriples.length) {
            return next(new ApiError(data.res, 404, 'Event not found.'));
        }
        event = eventTriples[0][0];
        instance = event.substring(0, event.lastIndexOf('/')); // extract instance iri from event

        // Make sure the instance used in the sequence exists
        cayley.getIri(body.instance, function (err, sequenceInstanceTriples) {

            if (err) {
                return next(new ApiError(data.res, 500, err.message));
            }
            if (!sequenceInstanceTriples.length) {
                return next(new ApiError(data.res, 404, 'Sequence instance not found.'));
            }
            sequenceInstance = sequenceInstanceTriples[0][0];

            // if sequence is of type EventEmit make sure the event emited exists
            if (body.emit !== 'undefined') {
                cayley.getIri(body.emit, function (err, emitTriples) {

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
        cayley.getEventSequences(event, function (err, sequencesTriples) {

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
        cayley.addEdge(sequenceParent, FLOW + 'sequence', sequence['@id'], function (err) {

            if (err) {
                return next(new ApiError(data.res, 500, err.message));
            }

            // prepare to add dependency links
            if (sequenceInstance === instance) { // do not add dependency if sequence uses its own instance
                return finish();
            }

            // do not add dependency if it already exists
            var graph = cayley.client.graph;
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
                cayley.addEdge(instance, FLOW + 'dependency', sequenceInstance, function (err) {

                    if (err) {
                        return next(new ApiError(data.res, 500, err.message));
                    }

                    finish();
                });
            });
        });

        function finish () {
            // generate the result
            cayley.getIri(sequence['@id'], function (err, sequenceTriples) {

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