"use strict"

const Transform = require('stream').Transform;

exports.toTriple = (scope, inst, args, data, next) => {

    const transform = new Transform({
        objectMode: true,
        transform: (chunk, enc, done) => {
            done(null, [
                chunk.subject.charAt(0) === '<' ? chunk.subject.slice(1, -1) : chunk.subject,
                chunk.predicate.slice(1, -1),
                chunk.id.charAt(0) === '<' ? chunk.id.slice(1, -1) : chunk.id
            ]);
        }
    });
    data.readable = data.readable.pipe(transform);

    next(null, data);
};
