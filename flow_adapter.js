'use strict'

const cayley = require('cayley');
const vocab = 'http://schema.jillix.net/vocab/';
const type_predicate = 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type';
const client = cayley(process.flow_env.db);
const g = client.graph; 

exports.read = (args, data, next) => {

    const event_iri = data.event;
    const role = data.session ? data.session.role || '*' : '*';
    const array = [];
    let count = 0;

    // TODO stream API for node cayley
    const handler = (err, result) => {

        if (err) {
            return next(err);
        }

        if (result && result.length) {
            result.forEach(item => array.push([item.subject, item.predicate, item.id]));
        }

        if (++count === 3) {

            if (!array.length) {
                return next(new Error('Flow-nodejs.adapter.cayley.read: Empty result for "' + event_iri + '".'));
            }

            next(null, array);
        }
    };

    // event
    g.V(event_iri).Tag('subject').Out([
      vocab + 'onError',
      vocab + 'onEnd',
      vocab + 'sequence',
    ], 'predicate').All(handler);

    // sequences
    g.V().Has(
      vocab + 'event',
      event_iri
    ).Has(
      type_predicate,
      vocab + 'Sequence'
    ).Tag('subject').Out([
      vocab + 'instance',
      vocab + 'args',
      vocab + 'dataHandler',
      vocab + 'onceHandler',
      vocab + 'streamHandler',
      vocab + 'emit',
      vocab + 'sequence'
    ], 'predicate').All(handler);

    // instances
    g.V().Has(
      vocab + 'event',
      event_iri
    ).Has(
      type_predicate,
      vocab + 'Sequence'
    ).Out(vocab + 'instance').
    Has(vocab + 'roles', '"' + role + '"').
    Tag('subject').Out([
        vocab + 'args',
        vocab + 'roles',
        vocab + 'module'
    ], 'predicate').All(handler);
};

exports.mod = (args, data, next) => {

    const module_iri = data.module;
    const session = data.session;

    // TODO role check for modules
    g.V(module_iri).Out([
        'http://schema.org/name',
        'http://schema.jillix.net/vocab/gitRepository'
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