// RDF constants
const RDF_SYNTAX = '<http://www.w3.org/1999/02/22-rdf-syntax-ns#';
const FLOW_VOCAB = '<http://schema.jillix.net/vocab/';
const SCHEMA = '<http://schema.org/';

function getChildNodes (g, id, edgeType) {

    return [
        // get entrypoint nodes
        g.V(id)
        .Out(FLOW_VOCAB + edgeType + '>')
        .Tag('subject')
        .Save(RDF_SYNTAX + 'type>', 'predicate')
        .Out(SCHEMA + 'name>')
        .Out(RDF_SYNTAX + 'string>')
        .All(),

        // get entrypoint edges
        g.V(id)
        .Tag('subject')
        .Out(FLOW_VOCAB + edgeType + '>', 'predicate')
        .All()
    ]
}
 
/* VISUALIZATION QUERIES */

// get network nodes with name
exports.vis_networks = (g, user_id) => {
    return g.V().Has(RDF_SYNTAX + 'type>', FLOW_VOCAB + 'Network>')
    .Tag('subject')
    .Save(RDF_SYNTAX + 'type>', 'predicate')
    .Out(SCHEMA + 'name>')
    .Out(RDF_SYNTAX + 'string>')
    .All();
};

// get all entrypoints of a network
exports.vis_entrypoints = (g, network_id) => {
    return getChildNodes(g, network_id, 'entrypoint');
};

// get details of an entrypoint
exports.vis_entrypoint = (g, entrypoint_id) => {

    const seq = getChildNodes(g, entrypoint_id, 'sequence');
    return ([

        // get environment nodes
        g.V(entrypoint_id)
        .Tag('subject')
        .Out(FLOW_VOCAB + 'environment>', 'predicate') 
        .Out(SCHEMA + 'name>')
        .Out(RDF_SYNTAX + 'string>')
        .All(),

        // get environment edge
        //g.V(entrypoint_id)
        //.Tag('subject')
        //.Out(FLOW_VOCAB + 'environment>', 'predicate')
        //.All(),
    ]).concat(seq);
};

// get details of a sequence inclusive handlers
exports.vis_sequence = (g, sequence_id) => {
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
exports.vis_handler = (g, handler_id) => {
    return [

        // state node
        g.V(handler_id)
        .Tag('subject')
        .Out(FLOW_VOCAB + 'state>', 'predicate')
        .Out(RDF_SYNTAX + 'string>')
        .All(),

        // arguments node
        g.V(handler_id)
        .Tag('subject')
        .Out(FLOW_VOCAB + 'args>', 'predicate')
        .Out(SCHEMA + 'name>')
        .Out(RDF_SYNTAX + 'string>')
        .All(),

         // handler edges
        g.V(handler_id)
        .Tag('subject')
        .Out([
            FLOW_VOCAB + 'fn>',
            FLOW_VOCAB + 'sequence>'
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
        .All(),

        // emit sequence
        g.V(handler_id)
        .Out(FLOW_VOCAB + 'sequence>')
        .Tag('subject')
        .Save(RDF_SYNTAX + 'type>', 'predicate')
        .Out(SCHEMA + 'name>')
        .Out(RDF_SYNTAX + 'string>')
        .All()
    ];
};
