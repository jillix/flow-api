"use strict"

const resolve = require("path").resolve;

if (!process.argv[2]) {
    throw new Error("Please specify a path to a sequence folder.");
}

const seq_path = resolve(process.argv[2]);
const API = require(__dirname + "/index.js");

// test converter toRDF
API.toRDF(seq_path);
