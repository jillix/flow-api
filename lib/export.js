"use strict"

const fs = require("fs");
const path = require("path");

function normalizeDirPath (target) {

    if (path.extname(target)) {
        target = path.dirname(target);
    }

    return path.normalize(target) + "/";
}

exports.toJSON = (target) => {

    target = normalizeDirPath(target);

    // ..open writable file stream
    const rdf_file = fs.createWriteStream(path.resolve(target + "../__rdf.nq"));

    const parser = new Promise((resolve, reject) => {
        fs.readdir(target, (err, files) => {
            if (err) {
                reject(err);
            } else {
                resolve(files);
            }
        });
    })
    .then((files) => {

        return new Promise((resolve, reject) => {
            let index = 0;
            const next = (file) => {
                fs.readFile(target + file, (err, data) => {
                    if (err) {
                        return reject(err);
                    }

                    try {
                        convertToRdf(rdf_file, JSON.parse(data.toString()));
                    } catch (err) {
                        reject(err);
                    }

                    if (!files[++index]) {
                        return resolve("parsing finished!");
                    }

                    next(files[index]);
                });
            };
            next(files[index]);
        });
    })
    .then((message) => {
        console.log("Resolved:", message);
    })
    .catch((err) => {
        // ..remove file
        console.log("Rejected:", err);
    });
};
