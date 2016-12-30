// RDF constants
const RDF_SYNTAX = '<http://www.w3.org/1999/02/22-rdf-syntax-ns#';
const FLOW_VOCAB = '<http://schema.jillix.net/vocab/';
const SCHEMA = '<http://schema.org/';

// get details of a handler 
exports.put = (g, handler_id) => {

    client.write([{
        subject: "Subject Node",
        predicate: "Predicate Node",
        object: "Object Node"
    }], function(err, body, res) {

    });

    client.delete([{
        subject: "Subject Node",
        predicate: "Predicate Node",
        object: "Object Node"
    }], function(err, body, res) {

    });
};
