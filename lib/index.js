// Dependencies
var Promise = require("bluebird")
  , Fs = Promise.promisifyAll(require("fs"))
  , Ul = require("ul")
  ;

// Constants
const DEFAULT_PACKAGE = {
        components: {
            scripts: []
          , styles: []
          , markup: []
        }
      , flow: []
      , clientFlow: []
    }
  , DOT_SERVICE = {
        client: {
            methods: {}
          , emits: {}
        }
    }
  ;

function EngineTools() {}

/**
 * generateModuleService
 * Generates content for .service.json file.
 *
 * @name generateModuleService
 * @function
 * @param {String} path The path to the package.json file.
 * @param {Function} callback A function called with error and .serivce.json file content.
 * @return {Promise} A promise used to run the function steps.
 */
EngineTools.prototype.generateModuleService = function (path, callback) {

    if (typeof path === "function") {
        callback = path;
        path = process.cwd() + "/package.json";
    }

    Fs.readFileAsync(path)
        .then(JSON.parse)
        .then(function (package) {
            package = Ul.merge(package, DEFAULT_PACKAGE);

            var dotService = Ul.clone(DOT_SERVICE)
              , mainFile = package.components.scripts
              , mod = {}
              ;

            try {
                mod = require(mainFile)
                mod.init()
            } catch (e) {}

            var methods = Object.keys(mod);
            methods.forEach(function (c) {
                dotService.client.methods[c] = {};
            });

            return dotService;
        })
        .then(function (dotService) {
            callback(null, dotService);
        })
        .catch(function (err) {
            callback(err);
        })
        ;
};

EngineTools.prototype.generateSymlinks = function (path, callback) {
    // TODO
    throw new Error("Not yet implemented.");
};

module.exports = new EngineTools();
