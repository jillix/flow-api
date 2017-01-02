// RDF constants
const RDF_SYNTAX = '<http://www.w3.org/1999/02/22-rdf-syntax-ns#';
const FLOW_VOCAB = '<http://schema.jillix.net/vocab/';
const SCHEMA = '<http://schema.org/';

// get details of a handler 
exports.put = (client, triple) => {

    console.log('Cayley.PUT:');
    console.log('- Sub:', triple[0]);
    console.log('- Pre:', triple[1]);
    console.log('- Obj:', triple[2]);
    console.log('----------------------');

    // subject
    // ["parent_id", "type", "hash/name"]
    // ["parent_id"]
    // NAME:
    // 1.   hash name
    // 2.   hash exists?
    // 2.0  N:  add hash > string > name
    //          add id > name > hash
    // 2.1  Y:  del id > name > old hash
    //          add id > name > hash

    // OBJECT:
    //*1. hash object
    //*2. hash exists?
    //
    return;
    const wstream = client.write([{
        subject: "Subject Node",
        predicate: "Predicate Node",
        object: "Object Node"
    }]);

    const dstream = client.delete([{
        subject: "Subject Node",
        predicate: "Predicate Node",
        object: "Object Node"
    }]);
};
