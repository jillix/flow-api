const EngineParser = require("engine-parser")
    , EntrypointManager = require("engine-entrypoint-manager")
    , findValue = require("find-value")
    , setValue = require("set-value")
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
    setListenerData (instanceName, listenerName, dataArr, cb) {
        this.readInstance(instanceName, (err, data)  => {
            if (err) { return cb(err); }
            listenerName = listenerName.replace(/\./g, "\\.");
            setValue(data, `flow.${listenerName}.d`, dataArr);
            this.updateInstance(instanceName, data, cb);
        });
    }
    setErrorEvent (instanceName, listenerName, errEvent, cb) {
        this.readInstance(instanceName, (err, data)  => {
            if (err) { return cb(err); }
            listenerName = listenerName.replace(/\./g, "\\.");
            setValue(data, `flow.${listenerName}.r`, errEvent);
            this.updateInstance(instanceName, data, cb);
        });
    }
    setEndEvent (instanceName, listenerName, endEvent, cb) {
        this.readInstance(instanceName, (err, data)  => {
            if (err) { return cb(err); }
            listenerName = listenerName.replace(/\./g, "\\.");
            setValue(data, `flow.${listenerName}.e`, errEvent);
            this.updateInstance(instanceName, data, cb);
        });
    }
}

module.exports = FlowApi;
