// Dependencies
const cayley = require('cayley')

// RDF constants
const RDF_SYNTAX = '<http://www.w3.org/1999/02/22-rdf-syntax-ns#';
const FLOW_VOCAB = '<http://schema.jillix.net/vocab/';
const SCHEMA = '<http://schema.org/';

// export the cayley client for custom use
exports.connect = (scope, state, args, data, next) => {
    state.client = cayley(scope.env.db);
    state.g = state.client.graph;
    return next ? next(null, data) : data;
};

/* ADAPTER CAYLEY QUERIES */

// get entrypoint for adapter
exports.adapter = (g, entrypoint_name) => {
    return [

        // get entrypoint vars
        g.V(entrypoint_name).In().In()
        .Has(RDF_SYNTAX + 'type>', FLOW_VOCAB + 'Entrypoint>')
        .Tag('subject')
        .Out(FLOW_VOCAB + 'environment>', 'predicate')
        .Out(FLOW_VOCAB + 'json>')
        .Out(RDF_SYNTAX + 'string>')
        .All(),

        // get sequence
        g.V(entrypoint_name).In().In().Tag('subject')
        .Has(RDF_SYNTAX + 'type>', FLOW_VOCAB + 'Entrypoint>')
        .Out(FLOW_VOCAB + 'sequence>', 'predicate')
        .All()
    ];
};

// reads sequence informations for flow
exports.flow = (g, sequence_id, role) => {
    return [

        // sequence details
        g.V(sequence_id)
        .Tag('subject')
        .Has(FLOW_VOCAB + 'role>', role)
        .Out([
            FLOW_VOCAB + 'role>',
            FLOW_VOCAB + 'onError>',
            FLOW_VOCAB + 'onEnd>',
            FLOW_VOCAB + 'next>',
        ], 'predicate')
        .All(),

        // sequence handler details
        g.V(sequence_id)
        .Has(FLOW_VOCAB + 'role>', role)
        .Out(FLOW_VOCAB + 'handler>')
        .Tag('subject')
        .Out([
            RDF_SYNTAX + 'type>',
            FLOW_VOCAB + 'state>',
            FLOW_VOCAB + 'fn>',
            FLOW_VOCAB + 'sequence>',
            FLOW_VOCAB + 'next>'
        ], 'predicate')
        .All(),

        // sequence handler args
        g.V(sequence_id)
        .Has(FLOW_VOCAB + 'role>', role)
        .Out(FLOW_VOCAB + 'handler>')
        .Tag('subject')
        .Out(FLOW_VOCAB + 'args>', 'predicate')
        .Out(FLOW_VOCAB + 'json>')
        .Out(RDF_SYNTAX + 'string>')
        .All()
    ];
};
 
/* BUILDER CAYLEY QUERIES */

// get network nodes with name
exports.networks = (g, user_id) => {
    return g.V().Has(RDF_SYNTAX + 'type>', FLOW_VOCAB + 'Network>')
    .Tag('subject')
    .Out(SCHEMA + 'name>')
    .Save(RDF_SYNTAX + 'type>', 'predicate')
    .Out(RDF_SYNTAX + 'string>')
    .All();
};

// get all entrypoints of a network
exports.entrypoints = (g, network_id) => {
    return [

        // get entrypoint nodes
        g.V(network_id)
        .Out(FLOW_VOCAB + 'entrypoint>')
        .Tag('subject')
        .Save(RDF_SYNTAX + 'type>', 'predicate')
        .Out(SCHEMA + 'name>')
        .Out(RDF_SYNTAX + 'string>')
        .All(),

        // get entrypoint edges
        g.V(network_id)
        .Tag('subject')
        .Out(FLOW_VOCAB + 'entrypoint>', 'predicate')
        .All()
    ]
};

// get details of an entrypoint
exports.entrypoint = (g, entrypoint_id) => {
    return [

        // get environment nodes
        g.V(entrypoint_id)
        .Out(FLOW_VOCAB + 'environment>')
        .Tag('subject')
        .Save(RDF_SYNTAX + 'type>', 'predicate')
        .Out(SCHEMA + 'name>')
        .Out(RDF_SYNTAX + 'string>')
        .All(),

        // get environment edge
        g.V(entrypoint_id)
        .Tag('subject')
        .Out(FLOW_VOCAB + 'environment>', 'predicate')
        .All(),

        // get sequence nodes
        g.V(entrypoint_id)
        .Out(FLOW_VOCAB + 'sequence>')
        .Tag('subject')
        .Save(RDF_SYNTAX + 'type>', 'predicate')
        .Out(SCHEMA + 'name>')
        .Out(RDF_SYNTAX + 'string>')
        .All(),

        // get sequence edge
        g.V(entrypoint_id)
        .Tag('subject')
        .Out(FLOW_VOCAB + 'sequence>', 'predicate')
        .All()
    ]
};

// get details of a sequence inclusive handlers
exports.sequence = (g, sequence_id) => {
    return [
        // get end/err sequences
        g.V(sequence_id)
        .Out([
            FLOW_VOCAB + 'onEnd>',
            FLOW_VOCAB + 'onError>'
        ])
        .Tag('subject')
        .Save(RDF_SYNTAX + 'type>', 'predicate')
        .Out(SCHEMA + 'name>')
        .Out(RDF_SYNTAX + 'string>')
        .All(),

        // get end/error/next edges
        g.V(sequence_id)
        .Tag('subject')
        .Out([
            FLOW_VOCAB + 'onEnd>',
            FLOW_VOCAB + 'onError>',
            FLOW_VOCAB + 'next>'
        ], 'predicate')
        .All(),

        // handler node
        g.V(sequence_id)
        .Out(FLOW_VOCAB + 'handler>')
        .Tag('subject')
        .Save(RDF_SYNTAX + 'type>', 'predicate')
        .Out(SCHEMA + 'name>')
        .Out(RDF_SYNTAX + 'string>')
        .All(),

        // handler edges
        g.V(sequence_id)
        .Out(FLOW_VOCAB + 'handler>')
        .Tag('subject')
        .Out(FLOW_VOCAB + 'next>', 'predicate')
        .All()
    ];
};

// get details of a handler 
exports.handler = (g, handler_id) => {
    return [

        // state node
        g.V(handler_id)
        .Tag('subject')
        .Out(FLOW_VOCAB + 'state>', 'predicate')
        .Out(RDF_SYNTAX + 'string>')
        .All(),

        // arguments node
        g.V(handler_id)
        .Out(FLOW_VOCAB + 'args>')
        .Tag('subject')
        .Save(RDF_SYNTAX + 'type>', 'predicate')
        .Out(SCHEMA + 'name>')
        .Out(RDF_SYNTAX + 'string>')
        .All(),

         // handler edges
        g.V(handler_id)
        .Tag('subject')
        .Out([
            FLOW_VOCAB + 'args>',
            FLOW_VOCAB + 'fn>'
        ], 'predicate')
        .All(),

        // argument's emits edges
        g.V(handler_id)
        .Tag('subject')
        .Out(FLOW_VOCAB + 'args>')
        .Out(FLOW_VOCAB + 'sequence>', 'predicate')
        .All(),

        // sequences
        g.V(handler_id)
        .Out(FLOW_VOCAB + 'args>')
        .Out(FLOW_VOCAB + 'sequence>')
        .Tag('subject')
        .Save(RDF_SYNTAX + 'type>', 'predicate')
        .Out(SCHEMA + 'name>')
        .Out(RDF_SYNTAX + 'string>')
        .All()
    ];
};
