// Dependencies
var Promise = require("bluebird")
  , Fs = Promise.promisifyAll(require("fs"))
  , Ul = require("ul")
  , JxUtils = require("jxutils")
  , Npm = require("npm")
  , FsPlus = require("fs-plus")
  , Async = require("async")
  , ReadJson = FsPlus.readJSON = require("read-json");
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
      , keywords: []
    }
  , DOT_SERVICE = {
        client: {
            methods: {}
          , emits: {}
        }
    }
  , JXENGINE_KEY = "jxengine"
  , ENGINE_APPS = process.env.ENGINE_APPS
  ;

function EngineTools() {}
EngineTools.Module = require("./module");

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

EngineTools.prototype.getNpmModules = function (callback) {
    Npm.load({}, function () {
        Npm.commands.search(JXENGINE_KEY, true, function (err, res) {
            if (err) {
                return callback(err);
            }
            var mods = [];
            Object.keys(res).forEach(function (name) {
                mods.push(new EngineTools.Module(res[name]));
            });

            callback(null, mods);
        });
    });
};

EngineTools.prototype.isEngineModule = function (input, callback) {

    var self = this;

    if (typeof input === "string") {
        if (!/package\.json$/.test(input)) {
            input += "/package.json";
        }
        FsPlus.readJSON(input, function (err, package) {
            self.isEngineModule(package, callback);
        });
    }

    package = Ul.merge(package, DEFAULT_PACKAGE);
    callback(package.keywords.indexOf(JXENGINE_KEY), package);
};

EngineTools.prototype.appModules = function (path, callback) {
    var self = this;
    path = FsPlus.normalize(path);
    FsPlus.list(path, [""], function (err, node_modules) {
        if (err) { return callback(err); }
        var engineModules = [];
        Async.parallel(node_modules.map(function (c) {
            return function (callback) {
                self.isEngineModule(FsPlus.normalize(path + "/" + c), function (is, pack) {
                    if (!is) { return callback(null, null); }
                    engineModules.push(new EngineTools.Module(pack));
                });
            }
        }), function (err) {
            callback(err, engineModules);
        });
    });
};

EngineTools.prototype.availableModules = function (app, callback) {

    var self = this
      , appPath = FsPlus.normalize(ENGINE_APPS + "/" + app)
      ;

    if (!FsPlus.existsSync(appPath)) {
        return callback(new Error("This project doesn't exist."));
    }
    var res = [];
    Async.parallel([
        function (callback) {
            self.getNpmModules(function (err, mods) {
                if (err) { return callback(err, mods); }
                res = res.concat(mods);
                callback(err, mods);
            });
        }
      , function (callback) {
            self.appModules(appPath, function (err, mods) {
                if (err) { return callback(err, mods); }
                res = res.concat(mods);
                callback(err, mods);
            });
        }
    ], function (err) {
        callback(err, res);
    });
};

module.exports = new EngineTools();
