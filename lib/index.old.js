// Dependencies
var Ul = require("ul")
  , Abs = require("abs")
  , FsPlus = require("fs-plus")
  , JxUtils = require("jxutils")
  , NpmKeyword = require("npm-keyword")
  , PackageJson = require("package-json")
  , ReadJson = require("r-json")
  , WriteJson = require("w-json")
  , Gry = require("gry")
  , GitUrlParse = require("giturlparse")
  , Tmp = require("tmp")
  , OArgv = require("oargv")
  , ExecLimiter = require("exec-limiter")
  , Path = require("path")
  , Lnf = require("lnf")
  , IsThere = require("is-there")
  , OneByOne = require("one-by-one")
  , SameTime = require("same-time")
  , Deffy = require("deffy")
  ;

// Create the exec limiter
var execLimit = new ExecLimiter(10);

// Constants
const DEFAULT_PACKAGE = {
        composition: {
            client: {
                module: []
              , config: {}
              , flow: []
              , styles: []
              , markup: []
            }
          , flow: []
        }
      , keywords: []
    }
  , DOT_SERVICE_MOD = {
        client: {
            dataHandlers: {}
          , streamHandlers: {}
          , streams: {}
        }
      , server: {
            dataHandlers: {}
          , streamHandlers: {}
          , streams: {}
        }
    }
  , JXENGINE_KEY = "jxengine"
  , ENGINE_APPS = process.env.ENGINE_APPS
  , DEFAULT_HOST = "jillix.com"
  , CWD = process.cwd()
  ;

function FlowApi() {}
FlowApi.Module = require("./module");

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
FlowApi.prototype.generateModuleService = function (path, callback) {

    if (typeof path === "function") {
        callback = path;
        path = process.cwd() + "/package.json";
    }

    path = Abs(path);

    OneByOne([
        ReadJson.bind(this, path)
      , function (next, package) {
            package = Ul.deepMerge(package, DEFAULT_PACKAGE);
            var dotService = Ul.clone(DOT_SERVICE_MOD)
              , mainFile = package.composition.module[0]
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

            next(null, dotService);
        }
    ], function (err, data) {
        callback(err, err ? null : data.slice(-1)[0]);
    });
};

/**
 * entrypoint
 * Generates entrypoints by providing needed data.
 *
 * @name entrypoint
 * @function
 * @param {String} username The username.
 * @param {String} app The app name.
 * @param {String} instance The instance name.
 * @param {String} host The host value.
 * @param {Boolean} pub A flag if the domain is public or not.
 * @return {String} The generated entrypoint.
 */
FlowApi.prototype.entrypoint = function (username, app, instance, host, pub) {

    // entrypoint(u, p, i, h);
    if (typeof pub !== "boolean") {
        pub = true;
    }

    // entrypoint(p, i, h);
    if (typeof host !== "string") {
        host = DEFAULT_HOST;
    }

    // Replace the points in the domain
    host = host.replace(/\./g, "_");

    // entrypoint(p, i);
    if (arguments.length === 2) {
        instance = app;
        app = username;
        username = null;
    }

    return instance + "_" + app
         + "_" + (username ? username + "_" : "")
         + host + (pub ? ".pub" : "")
         + ".json"
         ;
};


/**
 * getNpmModules
 * Fetches the Engine modules from NPM.
 *
 * @name getNpmModules
 * @function
 * @param {Function} callback The callback function.
 * @return {FlowApi} The `FlowApi` instance.
 */
FlowApi.prototype.getNpmModules = function (callback) {
    NpmKeyword(JXENGINE_KEY, function (err, packages) {
        if (err) { return callback(err); }
        packages = packages.map(function (c) {
            return new FlowApi.Module(c);
        });
        callback(null, packages);
    });
    return this;
};

/**
 * isEngineModule
 * Checks if the input is an Engine module.
 *
 * Usage
 *
 * ```js
 * // Path to the module directory
 * FlowApi.isEngineModule("path/to/node_modules/foo", function (isEngineModule, pack) {
 *    // do something
 * });
 *
 * // Path to the package.json
 * FlowApi.isEngineModule("path/to/node_modules/foo/package.json", function (isEngineModule, pack) {
 *    // do something
 * });
 *
 * // Some object
 * FlowApi.isEngineModule({
 *    keywords: ["jxengine"]
 * }, function (isEngineModule, pack) {
 *    // do something
 * });
 * ```
 *
 * @name isEngineModule
 * @function
 * @param {String|Object} input A string representing the path to a directory containing the package.json file or even to the package.json file or the package object itself.
 * @param {Function} callback The callback function called with two parameters: a boolean value (`true` if the provided input is an Engine module) and the package object.
 * @return {FlowApi} The `FlowApi` instance.
 */
FlowApi.prototype.isEngineModule = function (input, callback) {

    var self = this;

    if (typeof input === "string") {
        if (!/package\.json$/.test(input)) {
            input += "/package.json";
        }
        ReadJson(input, function (err, package) {
            if (err) { return callback(false, DEFAULT_PACKAGE); }
            self.isEngineModule(package, callback);
        });
        return self;
    }

    callback(
        !!input.composition,
        input
    );

    return self;
};

/**
 * appModules
 * Fetches the installed Engine modules.
 *
 * @name appModules
 * @function
 * @param {String} path The path to the app.
 * @param {Function} callback The callback function.
 * @return {FlowApi} The `FlowApi` instance.
 */
FlowApi.prototype.appModules = function (path, callback) {
    var self = this;
    path = Abs(path);
    FsPlus.list(path + "/node_modules", [""], function (err, node_modules) {
        if (err) { return callback(err); }
        var engineModules = [];
        SameTime(node_modules.map(function (c) {
            return function (opt_callback) {
                self.isEngineModule(c, function (is, pack) {
                    if (!is) { return opt_callback(null, null); }
                    engineModules.push(new FlowApi.Module(pack));
                    opt_callback(null);
                });
            }
        }), function (err) {
            callback(err, engineModules);
        });
    });
    return self;
};

/**
 * availableModules
 * Fetches the available modules for a app.
 *
 * @name availableModules
 * @function
 * @param {String} app The app name.
 * @param {Function} callback The callback function.
 * @return {FlowApi} The `FlowApi` instance.
 */
FlowApi.prototype.availableModules = function (app, callback) {

    var self = this
      , appPath = self.getAppPath(app)
      ;

    if (!self.appExistsSync(app)) {
        return callback(new Error("This app doesn't exist."));
    }

    var res = [];
    SameTime([
        self.getNpmModules
      , self.appModules.bind(self, appPath)
    ], function (err, data) {
        if (err) { return callback(err); }
        var uniq = {};
        data[0].concat(data[1]).forEach(function (c) {
            uniq[c.name] = c;
        });
        Object.keys(uniq).forEach(function (c) {
            res.push(uniq[c]);
        });
        callback(err, res);
    });

    return self;
};


/**
 * getModuleInfo
 * Gets information about a provided module.
 *
 * @name getModuleInfo
 * @function
 * @param {String} module The module to get info about (can be a npm module name or a git url).
 * @param {Function} callback The callback function.
 * @return {FlowApi} The `FlowApi` instance.
 */
FlowApi.prototype.getModuleInfo = function (module, callback) {
    var self = this
      , parsed = GitUrlParse(module)
      , info = {
            fromNpm: false
          , git_url: null
          , version: null
          , name: ""
        }
      ;

    // Suppose it's a npm package
    if (parsed.protocol === "file") {
        PackageJson(module, "latest", function (err, res) {
            if (err) { return callback(err); }
            info.fromNpm = true;
            info.version = res.version;
            info.name = res.name;
            callback(null, info);
        });
    }

    // Git url
    else {
        var repo = new Gry(Tmp.dirSync().name);
        repo.exec(OArgv({
            _: [parsed.toString("ssh"), "."]
        }, "clone"), function (err) {
            if (err) { return callback(err); }
            ReadJson(self.packPath(repo.cwd), function (err, pack) {
                if (err) { return callback(err); }
                info.version = pack.version;
                info.name = pack.name;
                info.git_url = parsed.source === "github.com"
                            ? parsed.owner + "/" + parsed.name + ".git"
                            : parsed.toString("ssh")
                            ;
                callback(null, info);
            });
        });
    }

    return self;
};

/**
 * installModule
 * Installs a provided module in a provided app.
 *
 * @name installModule
 * @function
 * @param {String} app The app name.
 * @param {String} module The module to install (can be a npm module name or a git url).
 * @param {Function} callback The callback function.
 * @return {FlowApi} The `FlowApi` instance.
 */
FlowApi.prototype.installModule = function (app, module, callback) {
    var self = this;
    self.appPack(app, function (err, pack) {
        if (err) { return callback(err); }
        pack = Ul.merge(pack, {
            dependencies: {}
        });

        self.getModuleInfo(module, function (err, modInfo) {
            if (err) { return callback(err); }


            function add(clb) {
                pack.dependencies[modInfo.name] = modInfo.fromNpm ? modInfo.version : modInfo.git_url;
                WriteJson(self.appPackPath(app), pack, clb);
            }

            function install(clb) {
                var mod = modInfo.fromNpm ? [modInfo.name, modInfo.version].join("@") : pack.dependencies[modInfo.name];
                if (FsPlus.isDirectorySync(self.getAppPath(app) + "/node_modules/" + modInfo.name)) {
                    return clb(null, pack);
                }
                execLimit.add(OArgv({
                    _: ["i", mod]
                }, "npm"), { cwd: self.getAppPath(app) }, function (err) {
                    if (err) { return callback(err); }
                    callback(null, modInfo);
                });
            }

            add(function (err) {
                if (err) { return callback(err); }
                install(callback);
            });
        });
    });
    return self;
};

/**
 * checkNames
 * Checks the composition file names.
 *
 * @name checkNames
 * @function
 * @param {String} app The app name.
 * @param {Function} callback The callback function.
 */
FlowApi.prototype.checkNames = function (app, callback) {
    var self = this;
    self.getComposition(app, { iName: true }, function (err, composition) {
        if (err) { return callback(err); }
        Object.keys(composition).forEach(function (cName) {
            var cInstance = composition[cName];

            if (typeof cInstance.name !== "string") {
                return callback(new Error("Missing or invalid `name` field in composition file: " + cName));
            }
            if (cInstance.name !== cName) {
                return callback(new Error("Name is not correct (should be updated with the file name) in  composition file: " + cName + ". Expected " + cName + " but saw " + cInstance.name));
            }
        });
    });
};

/**
 * nameFromInstancePath
 * Gets the instance name by providing the path.
 *
 * @name nameFromInstancePath
 * @function
 * @param {String} path The instance path.
 * @return {String} The instance name.
 */
FlowApi.prototype.nameFromInstancePath = function (path) {
    return Path.basename(path).slice(0, -5);
};

/**
 * setNames
 * Sets the instance names using the file names.
 *
 * @name setNames
 * @function
 * @param {String} app The app name.
 * @param {Function} callback The callback function.
 */
FlowApi.prototype.setNames = function (app, callback) {
    var self = this;
    self.getComposition(app, function (err, composition) {
        if (err) { return callback(err); }
        var arr = [];
        Object.keys(composition).forEach(function (cPath) {
            var cBasename = self.nameFromInstancePath(cPath)
              , cInstance = composition[cPath]
              ;

            if (cInstance.name !== cBasename) {
                cInstance.name = cBasename;
                arr.push(function (cb) {
                    WriteJson(cPath, cInstance, cb);
                });
            }
        });

        SameTime(arr, callback);
    });
};

/**
 * getModuleInfo
 * Gets the module information.
 *
 * @name getModuleInfo
 * @function
 * @param {String} app The app name.
 * @param {String} mod The module name.
 * @param {Function} callback The callback function.
 */
FlowApi.prototype.getModuleInfo = function (app, mod, callback) {
    var self = this;
    if (typeof mod === "function") {
        callback = mod;
        mod = "";
    }
    if (!mod) {
        return self.appModules(self.getAppPath(app), function (err, data) {
            if (err) { return callback(err); }
            self.getModuleInfo(app, data.map(function (c) {
                return c.name;
            }), callback);
        });
    }

    if (Array.isArray(mod)) {
        var res = {};
        return SameTime(mod.map(function (cMod) {
            return function (cb) {
                self.getModuleInfo(app, cMod, function (err, data) {
                    !err && (res[cMod] = data);
                    cb(err, data);
                });
            }
        }), function (err) {
            callback(err, res);
        });
    }


    SameTime([
        self.getService.bind(self, app, mod)
      , self.modulePack.bind(self, app, mod)
    ], function (err, data) {
        data[1] = Ul.deepMerge(data[1], DEFAULT_PACKAGE);
        callback(null, {
            service: data[0]
          , package: data[1]
        });
    });
};

module.exports = new FlowApi();