// Dependencies
var Promise = require("bluebird")
  , Fs = Promise.promisifyAll(require("fs"))
  , Ul = require("ul")
  , JxUtils = require("jxutils")
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
              , mainFile = package.components.scripts[0]
              , mod = require(path.split("/").slice(0, -1).join("/") + "/" + mainFile)
              ;

            try {
                mod.init.call(mod);
            } catch (e) {}

            var methods = Object.keys(JxUtils.flattenObject(mod));
            methods.forEach(function (c) {
                if (c === "init") { return; }
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
