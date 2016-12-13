"use strict"

const Transform = require('stream').Transform;

exports.toArray = (scope, inst, args, data, next) => {

    const transform = new Transform({
        objectMode: true,
        transform: (chunk, enc, done) => {
            done(null, [
                chunk.subject,
                chunk.predicate,
                chunk.id || chunk.object
            ]);
        }
    });
    data.readable = data.readable.pipe(transform);

    return next ? next(null, data) : data;
};
