"use strict"

const Transform = require('stream').Transform;
const PassThrough = require('stream').PassThrough;

exports.combine = (streams) => {

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
        stream.on('data', (chunk) => {combinedStream.push(chunk)});
        stream.on('error', endHandler);
        stream.on('end', endHandler);
    });

    return combinedStream;
};

exports.toArray = () => {
    return new Transform({
        objectMode: true,
        transform: (triple, enc, done) => {
            done(null, [
                triple.subject,
                triple.predicate,
                triple.id || triple.object
            ]);
        }
    });
};
