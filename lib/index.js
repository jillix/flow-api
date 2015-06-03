// Dependencies
var Promise = require("bluebird")
  , Fs = Promise.promisifyAll(require("fs"))
  , Ul = require("ul")
  , JxUtils = require("jxutils")
  , NpmKeyword = require("npm-keyword")
  , PackageJson = require("package-json")
  , FsPlus = require("fs-plus")
  , Async = require("async")
  , ReadJson = FsPlus.readJSON = require("read-json")
  , WriteJson = FsPlus.writeJSON = require("write-json")
  , Gry = require("gry")
  , GitUrlParse = require("giturlparse")
  , Tmp = require("tmp")
  , OArgv = require("oargv")
  , ExecLimiter = require("exec-limiter")
  , Path = require("path")
  , Lnf = require("lnf")
  ;

// Create the exec limiter
var execLimit = new ExecLimiter(10);

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
  , DEFAULT_HOST = "jillix.com"
  , CWD = process.cwd()
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

/**
 * entrypoint
 * Generates entrypoints by providing needed data.
 *
 * @name entrypoint
 * @function
 * @param {String} username The username.
 * @param {String} project The project name.
 * @param {String} instance The instance name.
 * @param {String} host The host value.
 * @param {Boolean} pub A flag if the domain is public or not.
 * @return {String} The generated entrypoint.
 */
EngineTools.prototype.entrypoint = function (username, project, instance, host, pub) {

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
        instance = project;
        project = username;
        username = null;
    }

    return instance + "_" + project
         + "_" + (username ? username + "_" : "")
         + host + (pub ? ".pub" : "")
         + ".json"
         ;
}

/**
 * generateSymlinks
 * Generates symlinks for a provided project.
 *
 * @name generateSymlinks
 * @function
 * @param {String} project The project name.
 * @param {String} username The username.
 * @param {Function} callback The callback function.
 * @return {EngineTools} The `EngineTools` instance.
 */
EngineTools.prototype.generateSymlinks = function (project, username, callback) {
    var self = this;

    if (typeof username === "function") {
        callback = username;
        username = null;
    }

    var path = self.getProjectPath(project);

    if (!FsPlus.existsSync(path)) {
        return callback(new Error("Application cannot be found."));
    }

    var compDir = path + "/composition";
    if (!FsPlus.existsSync(compDir)) {
        return callback(new Error("Composition directory is missing."));
    }

    // Get the instances
    FsPlus.list(compDir, ["json"], function (err, instances) {
        if (err) { return callback(err); }
        Async.parallel(instances.filter(function (c) {
            return !FsPlus.isSymbolicLinkSync(c);
        }).map(function (c) {
            return function (opt_callback) {
                FsPlus.readJSON(c, opt_callback);
            }
        }), function (err, instances) {
            if (err) { return callback(err); }
            Async.parallel(instances.map(function (c) {
                return Ul.merge(c, {
                    roles: {}
                  , client: {
                        config: {
                            template: {
                            }
                        }
                    }
                });
            }).filter(function (c) {
                return c.module === "view" && c.client.config.template.to === "body";
            }).map(function (c) {
                return function (opt_callback) {

                    var sPath = self.entrypoint(username, project, c.name, DEFAULT_HOST, c.roles["*"])
                      , sName = compDir + "/" + sPath
                      ;

                    Lnf(
                        c.name + ".json"
                      , sName
                      , function (err) {
                            opt_callback(err, sPath);
                        }
                    );
                };
            }), function (err, paths) {
                callback(err, paths);
            });
        });
    });
    return EngineTools;
};

/**
 * packPath
 * Returns the full path to the package.json located into `path`.
 *
 * @name packPath
 * @function
 * @param {String} path The path to the directory containing the package.json file.
 * @return {String} The path to the package.json.
 */
EngineTools.prototype.packPath = function (path) {
    return FsPlus.normalize(path + "/package.json");
};

/**
 * projectPackPath
 * Returns the full path to the package.json located in the project.
 *
 * @name projectPackPath
 * @function
 * @param {String} project The project name.
 * @return {String} The path to the project package.json file.
 */
EngineTools.prototype.projectPackPath = function (project) {
    return this.packPath(this.getProjectPath(project));
};

/**
 * getProjectPath
 * Returns the full path to the project directory.
 *
 * @name getProjectPath
 * @function
 * @param {String} project The project name.
 * @return {String} The full path to the project directory.
 */
EngineTools.prototype.getProjectPath = function (project) {
    return FsPlus.normalize(ENGINE_APPS + "/" + project);
};

/**
 * projectExistsSync
 * Checks if the project exists or not.
 *
 * @name projectExistsSync
 * @function
 * @param {String} project The project name.
 * @return {Boolean} `true` if the project exists, `false` otherwise.
 */
EngineTools.prototype.projectExistsSync = function (project) {
    return FsPlus.existsSync(this.getProjectPath(project));
};

/**
 * projectPack
 * Fetches the project package.json object.
 *
 * @name projectPack
 * @function
 * @param {String} project The project name.
 * @param {Function} callback The callback function.
 * @return {EngineTools} The `EngineTools` instance.
 */
EngineTools.prototype.projectPack = function (project, callback) {
    FsPlus.readJSON(this.projectPackPath(project), callback);
    return this;
};

/**
 * getNpmModules
 * Fetches the Engine modules from NPM.
 *
 * @name getNpmModules
 * @function
 * @param {Function} callback The callback function.
 * @return {EngineTools} The `EngineTools` instance.
 */
EngineTools.prototype.getNpmModules = function (callback) {
    NpmKeyword(JXENGINE_KEY, function (err, packages) {
        if (err) { return callback(err); }
        packages = packages.map(function (c) {
            return new EngineTools.Module(c);
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
 * EngineTools.isEngineModule("path/to/node_modules/foo", function (isEngineModule, pack) {
 *    // do something
 * });
 *
 * // Path to the package.json
 * EngineTools.isEngineModule("path/to/node_modules/foo/package.json", function (isEngineModule, pack) {
 *    // do something
 * });
 *
 * // Some object
 * EngineTools.isEngineModule({
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
 * @return {EngineTools} The `EngineTools` instance.
 */
EngineTools.prototype.isEngineModule = function (input, callback) {

    var self = this;

    if (typeof input === "string") {
        if (!/package\.json$/.test(input)) {
            input += "/package.json";
        }
        FsPlus.readJSON(input, function (err, package) {
            self.isEngineModule(package, callback);
        });
        return self;
    }

    input = Ul.merge(input, DEFAULT_PACKAGE);
    callback(input.keywords.indexOf(JXENGINE_KEY) !== -1, input);

    return self;
};

/**
 * appModules
 * Fetches the installed Engine modules.
 *
 * @name appModules
 * @function
 * @param {String} path The path to the project.
 * @param {Function} callback The callback function.
 * @return {EngineTools} The `EngineTools` instance.
 */
EngineTools.prototype.appModules = function (path, callback) {
    var self = this;
    path = FsPlus.normalize(path);
    FsPlus.list(path + "/node_modules", [""], function (err, node_modules) {
        if (err) { return callback(err); }
        var engineModules = [];
        Async.parallel(node_modules.map(function (c) {
            return function (opt_callback) {
                self.isEngineModule(c, function (is, pack) {
                    if (!is) { return opt_callback(null, null); }
                    engineModules.push(new EngineTools.Module(pack));
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
 * Fetches the available modules for a project.
 *
 * @name availableModules
 * @function
 * @param {String} app The project name.
 * @param {Function} callback The callback function.
 * @return {EngineTools} The `EngineTools` instance.
 */
EngineTools.prototype.availableModules = function (app, callback) {

    var self = this
      , appPath = self.getProjectPath(app)
      ;

    if (!self.projectExistsSync(app)) {
        return callback(new Error("This project doesn't exist."));
    }

    var res = [];
    Async.parallel([
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
 * @return {EngineTools} The `EngineTools` instance.
 */
EngineTools.prototype.getModuleInfo = function (module, callback) {
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
            FsPlus.readJSON(self.packPath(repo.cwd), function (err, pack) {
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
 * Installs a provided module in a provided project.
 *
 * @name installModule
 * @function
 * @param {String} project The project name.
 * @param {String} module The module to install (can be a npm module name or a git url).
 * @param {Function} callback The callback function.
 * @return {EngineTools} The `EngineTools` instance.
 */
EngineTools.prototype.installModule = function (project, module, callback) {
    var self = this;
    self.projectPack(project, function (err, pack) {
        if (err) { return callback(err); }
        pack = Ul.merge(pack, {
            dependencies: {}
        });

        self.getModuleInfo(module, function (err, modInfo) {
            if (err) { return callback(err); }


            function add(clb) {
                pack.dependencies[modInfo.name] = modInfo.fromNpm ? modInfo.version : modInfo.git_url;
                FsPlus.writeJSON(self.projectPackPath(project), pack, clb);
            }

            function install(clb) {
                var mod = modInfo.fromNpm ? [modInfo.name, modInfo.version].join("@") : pack.dependencies[modInfo.name];
                if (FsPlus.isDirectorySync(self.getProjectPath(project) + "/node_modules/" + modInfo.name)) {
                    return clb(null, pack);
                }
                execLimit.add(OArgv({
                    _: ["i", mod]
                }, "npm"), { cwd: self.getProjectPath(project) }, function (err) {
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
 * linkData
 * Generates a wrapper function for `link.data`.
 *
 * @name linkData
 * @function
 * @param {Function} callback The callback function called with error and data.
 * @return {Function} The wrapper function.
 */
EngineTools.prototype.linkData = function (callback) {
    return function (link) {
        link.data(function (err, data) {
            if (err) { return link.end(err); }
            callback.call(link, data, link);
        });
    };
};

module.exports = new EngineTools();
