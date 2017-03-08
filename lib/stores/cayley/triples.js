"use strict"

const Transform = require('stream').Transform;
const PassThrough= require('stream').PassThrough;
const JSONStream = require("JSONStream");

exports.parse = (streams, objectMode) => {
    if (streams instanceof Array) {

        // parse cayley result
        streams.forEach((stream, i) => {
            streams[i] = streams[i].pipe(JSONStream.parse('result.*'));
        });

        // merge all data into one stream 
        streams = combine(streams);
    } else {

        // parse cayley result
        streams = streams.pipe(JSONStream.parse('result.*'));
    }

    return toArray(streams, objectMode);

};

function combine (streams) {

    const combinedStream = new PassThrough({objectMode: true});
    const endHandler = (err) => {

        if (err) {
            combinedStream.emit('error', err);
            combinedStream.end();
            return;
        }

        !(--combinedStream.length) && combinedStream.end();
    };

    combinedStream.length = streams.length;
    streams.forEach((stream, index) => {
        stream.on('end', endHandler);
        stream.on('error', endHandler);
        stream.on('data', (chunk) => {
            if (!combinedStream.write(chunk)) {
                combinedStream.once('drain', () => {stream.resume()});
                stream.pause();
            };
        });
    });

    return combinedStream;
};

function toArray (stream, objectMode) {
    return stream.pipe(new Transform({
        objectMode: true,
        transform: (triple, enc, done) => {

            triple.id = triple.id || triple.object;
            if (!objectMode) {
                let string = '["' + triple.subject + '","' + triple.predicate + '",';
                if (triple.id.indexOf('{') === 0) {
                    string += triple.id;
                } else {
                    string += '"' + triple.id + '"';
                }
                string += ']';
                triple = string;
            } else {
                triple = [
                    triple.subject,
                    triple.predicate,
                    triple.id
                ];
            }

            done(null, triple);
        }
    }));
};
