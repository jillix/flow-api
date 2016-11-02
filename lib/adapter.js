// Dependencies
const cayley = require('./cayley');
const g = cayley.client.graph;

// RDF constants
const RDF_TYPE = 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type';
const FLOW_VOCAB = 'http://schema.jillix.net/vocab/';
const SCHEMA = 'http://schema.org/';

exports.read = (args, data, next) => {

    const eventIRI = '<' + data.event + '>';
    const role = data.session ? data.session.role || '*' : '*';
    const array = [];
    let count = 0;

    // TODO stream API for node cayley
    const handler = (err, result) => {

        if (err) {
            return next(err);
        }

        if (result && result.length) {
            result.forEach(item => array.push([
                item.subject[0] === '<' ? item.subject.slice(1, -1) : item.subject,
                item.predicate.slice(1, -1),
                item.id[0] === '<' ? item.id.slice(1, -1) : item.id
            ]));
        }
        if (++count === 3) {

            if (!array.length) {
                return next(new Error('Flow-nodejs.adapter.cayley.read: Empty result for "' + event_iri + '".'));
            }

            data.result = array;
            next(null, data);
        }
    };

    // event
    g.V(eventIRI).Tag('subject').Out([
        '<' + FLOW_VOCAB + 'onError>',
        '<' + FLOW_VOCAB + 'onEnd>',
        '<' + FLOW_VOCAB + 'sequence>'
    ], 'predicate').All(handler);

    // sequences
    g.V().Has(
        '<' + FLOW_VOCAB + 'event>',
        eventIRI
    ).Has(
        '<' + RDF_TYPE + '>',
        '<' + FLOW_VOCAB + 'Sequence>'
    ).Tag('subject').Out([
        '<' + FLOW_VOCAB + 'instance>',
        '<' + FLOW_VOCAB + 'args>',
        '<' + FLOW_VOCAB + 'dataHandler>',
        '<' + FLOW_VOCAB + 'onceHandler>',
        '<' + FLOW_VOCAB + 'streamHandler>',
        '<' + FLOW_VOCAB + 'emit>',
        '<' + FLOW_VOCAB + 'sequence>'
    ], 'predicate').All(handler);

    // instances
    g.V().Has(
        '<' + FLOW_VOCAB + 'event>',
        eventIRI
    ).Has(
        '<' + RDF_TYPE + '>',
        '<' + FLOW_VOCAB + 'Sequence>'
    ).Out('<' + FLOW_VOCAB + 'instance>').
    Has('<' + FLOW_VOCAB + 'roles>', role).
    Tag('subject').Out([
        '<' + FLOW_VOCAB + 'args>',
        '<' + FLOW_VOCAB + 'roles>',
        '<' + FLOW_VOCAB + 'module>'
    ], 'predicate').All(handler);
};

exports.mod = (args, data, next) => {

    // TODO role check for modules
    g.V('<' + data.module + '>').Out([
        '<' + SCHEMA + 'name>',
        '<' + FLOW_VOCAB + 'gitRepository>'
    ], 'predicate').GetLimit(2, (err, module) => {

        if (err) {
            return next(err);
        }

        if (!module || !module[0] || !module[0].id) {
            return next(new Error('Flow-nodejs.adapter.cayley.mod: Empty respone for ' + module_iri));
        }

        next(null, module);
    });
};