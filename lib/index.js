const EngineParser = require("engine-parser")
    , EntrypointManager = require("engine-entrypoint-manager")
    , findValue = require("find-value")
    , deffy = require("deffy")
    ;

class FlowApi extends EngineParser {
    constructor (appPath, compositionCrud) {
        super(appPath, compositionCrud);
        this.entrypoint = new EntrypointManager(this);
    }

    // Entrypoints
    addEntrypoint (en, cb) {
        return this.entrypoint.add(en, cb);
    }
    removeEntrypoint (en, cb) {
        return this.entrypoint.remove(en, cb);
    }
    listEntrypoints (cb) {
        return this.entrypoint.list(cb);
    }
    updateEntrypoint (oldEn, newEn, cb) {
        return this.entrypoint.update(oldEn, newEn, cb);
    }
    getModuleComposition (moduleName, cb) {
        this.getModulePackage(moduleName, (err, data) => {
            if (err) { return cb(err); }
            cb(null, deffy(findValue(data, "composition"), {}), data);
        });
    }
}

module.exports = FlowApi;
