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
  ;

// Create the exec limiter
var execLimit = new ExecLimiter(10);

// Constants
const DEFAULT_PACKAGE = {
        composition: {
            module: []
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

    path = Abs(path);

    OneByOne([
        ReadJson.bind(this, path)
      , function (next, package) {
            package = Ul.deepMerge(package, DEFAULT_PACKAGE);
            var dotService = Ul.clone(DOT_SERVICE)
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
};

/**
 * getCompositionDir
 * Returns the path to the composition directory.
 *
 * @name getCompositionDir
 * @function
 * @param {String} project The project name.
 * @return {String} The path to the composition directory.
 */
EngineTools.prototype.getCompositionDir = function (project) {
    return this.getProjectPath(project) + "/composition";
};

/**
 * getInstances
 * Gets the instances of a project.
 *
 * @name getInstances
 * @function
 * @param {String} project The project name.
 * @param {Function} callback The callback function.
 */
EngineTools.prototype.getInstances = function (project, callback) {
    var compDir = this.getCompositionDir(project);

    if (!IsThere(compDir)) {
        return callback(new Error("Composition directory cannot be found."));
    }

    // Get the instances
    OneByOne([
        FsPlus.list.bind(FsPlus, compDir, ["json"])
      , function (next, instances) {
            next(null, instances.filter(function (c) {
                return !FsPlus.isSymbolicLinkSync(c);
            }))
        }
    ], function (err, data) {
        callback(err, err ? {} : data.slice(-1)[0]);
    });
};

/**
 * getComposition
 * Reads the composition files and sends an object:
 *
 * ```js
 * { "path/to/some/instance.json": { ... }
 * ```
 *
 * @name getComposition
 * @function
 * @param {String} project The project name.
 * @param {Function} callback The callback function.
 */
EngineTools.prototype.getComposition = function (project, callback) {
    var self = this
      , result = {}
      ;

    OneByOne([
        self.getInstances.bind(self, project)
      , function (next, instances) {
            SameTime(instances.map(function (c) {
                return function (cb) {
                    ReadJson(c, function (err, comp) {
                        result[c] = comp;
                        cb(err, comp);
                    });
                }
            }), next);
        }
    ], function (err, data) {
        callback(err, result);
    });
};

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

    if (!IsThere(path)) {
        return callback(new Error("Application cannot be found."));
    }

    var compDir = path + "/composition";
    if (!IsThere(compDir)) {
        return callback(new Error("Composition directory is missing."));
    }

    // Get the instances
    self.getComposition(project, function (err, composition) {
        SameTime(Object.keys(composition).map(function (path) {
            var c = composition[path];
            return {
                _: Ul.deepMerge(c, {
                    roles: {}
                  , client: {
                        config: {
                            templates: {
                            }
                        }
                    }
                })
              , path: path
            };
        }).filter(function (c) {
            if (c._.module !== "view") { return false; }
            var templates = Object.keys(c._.config.templates);
            for (var i = 0; i < templates.length; ++i) {
                if (templates[i].to === "body") {
                    return true;
                }
            }
            return false;
        }).map(function (c) {
            return function (opt_callback) {

                var sPath = self.entrypoint(username, project, c._.name, DEFAULT_HOST, c._.roles["*"])
                  , sName = compDir + "/" + sPath
                  ;

                Lnf(
                    c._.name + ".json"
                  , c.path
                  , function (err) {
                        opt_callback(err, sPath);
                    }
                );
            };
        }), function (err, paths) {
            callback(err, paths);
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
    return Abs(path + "/package.json");
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
    return Abs(ENGINE_APPS + "/" + project);
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
    return IsThere(this.getProjectPath(project));
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
    ReadJson(this.projectPackPath(project), callback);
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
        ReadJson(input, function (err, package) {
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
    path = Abs(path);
    FsPlus.list(path + "/node_modules", [""], function (err, node_modules) {
        if (err) { return callback(err); }
        var engineModules = [];
        SameTime(node_modules.map(function (c) {
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
                WriteJson(self.projectPackPath(project), pack, clb);
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
        var inst = this;
        link.data(function (err, data) {
            if (err) { return link.end(err); }
            callback.call(inst, data, link);
        });
    };
};

/**
 * checkNames
 * Checks the composition file names.
 *
 * @name checkNames
 * @function
 * @param {String} project The project name.
 * @param {Function} callback The callback function.
 */
EngineTools.prototype.checkNames = function (project, callback) {
    var self = this;
    self.getComposition(project, function (err, composition) {
        if (err) { return callback(err); }
        Object.keys(composition).forEach(function (cPath) {
            var cBasename = Path.basename(cPath)
              , cInstance = composition[cPath]
              ;

            if (typeof cInstance.name !== "string") {
                return callback(new Error("Missing or invalid `name` field in composition file: " + cPath));
            }
            if (cInstance.name !== cBasename) {
                return callback(new Error("Name is not correct (should be updated with the file name) in  composition file: " + cPath + ". Expected " + cBasename + " but saw " + cInstance.name));
            }
        });
    });
};

module.exports = new EngineTools();
