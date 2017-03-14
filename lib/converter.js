"use strict"

// TODO use this file as a starting point for the data format conversions
exports.toRDF = (path) => {};
exports.toJSON = (network, target) => {};
return;

const crypto = require('crypto');
const resolve = require('path').resolve;
const fs = require('fs');
const suffixTest = /\.json$/;
const root = resolve(process.argv[2] || '.') + '/';
const env_config = require(root + 'flow.json');
const path = root + 'network/';
const sequences = {};
const files = fs.readdirSync(path);
const rdf_syntax = 'http://www.w3.org/1999/02/22-rdf-syntax-ns#';
const hashids = {};
const hashlbs = {};
const envs = {};
const fn_states = {};
const temp_index = {};

function write (subject, predicate, object) {
    process.stdout.write(subject + ' <' + predicate + '> ' + object + ' .\n');
}

function UID (len) {
    len = len || 23;
    let i = 0, random = '';
    for (; i < len; ++i) {
        random += '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'[0 | Math.random() * 62];
    }
    return '_:' + crypto.createHash('md5').update(random).digest('hex');
}

function getHash (string, name, type) {
    let hash = '_:' + crypto.createHash('md5').update(string).digest('hex');
    if (!hashids[hash]) {
        hashids[hash] = 1;
        write(hash, rdf_syntax + 'string', '"' + string.replace(/"/g, '\\"') + '"');
        write(hash, rdf_syntax + 'type', '<http://schema.jillix.net/vocab/' + (type || 'Name') + '>');

        if (name) {
            write(hash, 'http://schema.org/name', getHash(name));
        }
    }

    return hash;
}

function getFnState (name) {

    if (!fn_states[name]) {

        fn_states[name] = UID();

        write(
            fn_states[name],
            rdf_syntax + 'type',
            '<http://schema.jillix.net/vocab/State>'
        );

        // role name
        write(
            fn_states[name],
            'http://schema.org/name',
            getHash(name)
        );
    }

    return fn_states[name];
}

// public role
const public_role = getHash('*', "Public Role", "Role");

// Convert composition files to triples
files.forEach(file => {

    if (!suffixTest.test(file)) {
        return;
    }

    let group;
    try {
        group = JSON.parse(fs.readFileSync(path + file));
    } catch (error) {
        throw new Error(path + file + '\n' + error);
    }

    Object.keys(group).forEach((sequence) => {

        if (sequence[sequence]) {
            throw new Error('Converter: Duplicate sequence "' + sequence + '".');
        }

        sequences[sequence] = group[sequence];
    });
});

// create env objects
if (env_config) {

    if (env_config.environments) {
        env_config.environments.forEach(env => {
            const env_uid = UID();

            // create json edge
            write(
                env_uid,
                'http://schema.jillix.net/vocab/json',
                getHash(JSON.stringify(env.vars))
            );

            // evnironment type
            write(
                env_uid,
                rdf_syntax + 'type',
                '<http://schema.jillix.net/vocab/Args>'
            );

            // environment name
            write(
                env_uid,
                'http://schema.org/name',
                getHash(env.name)
            );

            envs[env.name] = env_uid;
        });
    }

    if (env_config.entrypoints) {
        env_config.entrypoints.forEach(ep => {

            const entrypoint_id = '_:' + crypto.createHash('md5').update(ep.emit).digest('hex');

            // entrypoint environment
            if (ep.env) {
                ep.env.forEach(env => {
                    if (envs[env]) {
                        write(
                            entrypoint_id,
                            'http://schema.jillix.net/vocab/args',
                            envs[env]
                        );
                    }
                });
            }
        });
    }
}

// sequences
for (let sequence in sequences) {
    let seq = sequences[sequence];
    let sequence_id = '_:' + crypto.createHash('md5').update(sequence).digest('hex');

    if (!seq[0] || !seq[0].length) {
        continue;
    }

    // name
    write(
        sequence_id,
        'http://schema.org/name',
        getHash(sequence.toUpperCase())
    ); 

    // type
    write(
        sequence_id,
        rdf_syntax + 'type',
        '<http://schema.jillix.net/vocab/Sequence>'
    );

    // roles
    write(
        sequence_id,
        'http://schema.jillix.net/vocab/role',
        public_role
    );

    // end event
    if (seq[2]) {
        write(
            sequence_id,
            'http://schema.jillix.net/vocab/onEnd',
            '_:' + crypto.createHash('md5').update(seq[2]).digest('hex')
        );
    }

    // error event
    if (seq[1]) {
        write(
            sequence_id,
            'http://schema.jillix.net/vocab/error',
            '_:' + crypto.createHash('md5').update(seq[1]).digest('hex')
        );
    }

    // handlers
    let previous;

    // handler
    seq[0].forEach((handler, index) => {

        let handler_id = UID();
        let handler_name = typeof handler === 'string' ? 'Emit:' + handler : handler[1] + '/' + handler[2];

        // name
        write(
            handler_id,
            'http://schema.org/name',
            getHash(handler_name) 
        );

        // sequence emit
        if (typeof handler === 'string') {

            // type Emit
            write(
                handler_id,
                rdf_syntax + 'type',
                '<http://schema.jillix.net/vocab/Emit>'
            );

            // sequence
            write(
                handler_id,
                'http://schema.jillix.net/vocab/sequence',
                '_:' + crypto.createHash('md5').update(handler).digest('hex')
            );

        // data handler
        } else {

            // state
            if (typeof handler[3] === 'string') {
                write(
                    handler_id,
                    'http://schema.jillix.net/vocab/state',
                    getFnState(handler[3])
                );
            }

            // type data
            write(
                handler_id,
                rdf_syntax + 'type',
                '<http://schema.jillix.net/vocab/Data>'
            );

            // function
            write(
                handler_id,
                'http://schema.jillix.net/vocab/fn',
                '<' + handler[0] + '/' + handler[1] + '?' + handler[2] + '>'
            );
        }
        
        // next
        write(
            index === 0 ? sequence_id : previous,
            'http://schema.jillix.net/vocab/next',
            handler_id
        );

        previous = handler_id;

        // link back to sequence (owner)
        write(
            sequence_id,
            'http://schema.jillix.net/vocab/handler',
            handler_id
        );

        // method args
        if (typeof handler !== 'string' && handler[4]) {
            let args = JSON.stringify(handler[4]);

            // potential emits from args
            let potential_emits = args.match(/\{FLOW\:([^\}]+)\}/g);
            let emits = [];
            if (potential_emits) {
                potential_emits.forEach(emit => {
                    let replace = emit;
                    emit = emit.slice(6, -1);
                    emit = '_:' + crypto.createHash('md5').update(emit).digest('hex');
                    args = args.replace(replace, emit);
                    emits.push(emit); 
                });
            }

            const args_uid = UID();

            write(
                handler_id,
                'http://schema.jillix.net/vocab/args',
                args_uid
            );

            // create json edge
            write(
                args_uid,
                'http://schema.jillix.net/vocab/json',
                getHash(args)
            );

            // args type
            write(
                args_uid,
                rdf_syntax + 'type',
                '<http://schema.jillix.net/vocab/Args>'
            );

            // args name
            write(
                args_uid,
                'http://schema.org/name',
                getHash("Args:" + handler[2])
            );

            emits.forEach(emit => {
                let key = args_uid + emit;
                if (!temp_index[key]) {
                    temp_index[key] = 1;
                    write(
                        args_uid,
                        'http://schema.jillix.net/vocab/sequence',
                        emit
                    );
                }
            });
        }
    });
}
