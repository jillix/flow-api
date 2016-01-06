const EngineParser = require("engine-parser")
    , entrypointManager = require("engine-entrypoint-manager")
    ;

class FlowApi extends EngineParser {
    constructor (appPath, compositionCrud) {
        super(appPath, compositionCrud);
        this.entrypoint = new EntrypointManager(this);
    }
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
}

module.exports = FlowApi;
