// Dependencies
var Promise = require("bluebird")
  , Fs = Promise.promisifyAll(require("fs"))
  , Ul = require("ul")
  , JxUtils = require("jxutils")
  , Npm = require("npm")
  , FsPlus = require("fs-plus")
  , Async = require("async")
  , ReadJson = FsPlus.readJSON = require("read-json")
  , WriteJson = FsPlus.writeJSON = require("write-json")
  , Gry = require("gry")
  , GitUrlParse = require("giturlparse")
  , Tmp = require("tmp")
  , OArgv = require("oargv")
  , ExecLimiter = require("exec-limiter")
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
        return FsPlus.readJSON(input, function (err, package) {
            self.isEngineModule(package, callback);
        });
    }

    input = Ul.merge(input, DEFAULT_PACKAGE);
    callback(input.keywords.indexOf(JXENGINE_KEY) !== -1, input);
};

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
};

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
};

EngineTools.prototype.packPath = function (path) {
    return FsPlus.normalize(path + "/package.json");
};

EngineTools.prototype.projectPackPath = function (project) {
    return this.packPath(this.getProjectPath(project));
};

EngineTools.prototype.getProjectPath = function (project) {
    return FsPlus.normalize(ENGINE_APPS + "/" + project);
};

EngineTools.prototype.projectExistsSync = function (project) {
    return FsPlus.existsSync(this.getProjectPath(project));
};

EngineTools.prototype.projectPack = function (project, callback) {
    FsPlus.readJSON(this.projectPackPath(project), callback);
};

EngineTools.prototype.getModuleInfo = function (module, callback) {
    var self = this
      , parsed = GitUrlParse(module)
      , info = {
            isNpm: false
          , git_url: null
          , version: null
          , name: ""
        }
      ;

    // Suppose it's a npm package
    if (parsed.protocol === "file") {
        Npm.load({}, function () {
            Npm.commands.view([module, "name", "version"], true, function (err, res) {
                if (err) { return callback(err); }
                var inf = res[Object.keys(res)[0]];
                info.isNpm = true;
                info.version = inf.version;
                info.name = inf.name;
                callback(null, info);
            });
        });
    }

    // Git url
    else {
        var repo = new Gry(Tmp.dirSync().name);
        repo.exec(OArgv({
            _: [module, "."]
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
};

EngineTools.prototype.installModule = function (project, module, callback) {
    var self = this;
    self.projectPack(project, function (err, pack) {
        if (err) { return callback(err); }
        pack = Ul.merge(pack, {
            dependencies: {}
        });

        self.getModuleInfo(module, function (err, modInfo) {
            if (err) { return callback(err); }

            pack.dependencies[modInfo.name] = modInfo.fromNpm ? modInfo.version : modInfo.git_url;
            var mod = modInfo.fromNpm ? [modInfo.name, modInfo.version].join("@") : pack.dependencies[modInfo.name];

            FsPlus.writeJSON(self.projectPackPath(project), pack, function (err) {
                if (err) { return callback(err); }
                execLimit.add(OArgv({
                    _: ["i", mod]
                }, "npm"), { cwd: self.getProjectPath(project) }, function (err) {
                    if (err) { return callback(err); }
                    callback(null, pack);
                });
            });
        });
    });
};

module.exports = new EngineTools();
