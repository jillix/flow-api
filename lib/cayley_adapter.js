// RDF constants
const RDF_SYNTAX = '<http://www.w3.org/1999/02/22-rdf-syntax-ns#';
const FLOW_VOCAB = '<http://schema.jillix.net/vocab/';
const SCHEMA = '<http://schema.org/';

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
