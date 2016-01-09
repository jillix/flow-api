const EngineParser = require("engine-parser")
    //, EntrypointManager = require("engine-entrypoint-manager")
    , findValue = require("find-value")
    , setValue = require("set-value")
    , deffy = require("deffy")
    ;

class FlowApi extends EngineParser {
    constructor (appPath, compositionCrud) {
        super(appPath, compositionCrud);
    }

    // TODO move entrypoints to the service-api
    // Entrypoints
    /*addEntrypoint (en, cb) {
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
    }*/
    getModuleComposition (moduleName, cb) {
        this.getModulePackage(moduleName, (err, data) => {
            if (err) { return cb(err); }
            cb(null, deffy(findValue(data, "composition"), {}), data);
        });
    }
    _sanitizeListenerName (name) {
        return name.replace(/\./g, "\\.");
    }
    _setCompositionField (obj, field, data) {
        setValue(obj, field, data);
        return data;
    }
    _setInstanceField (instanceName, field, dataToSet, cb) {
        return this.readInstance(instanceName, (err, data)  => {
            if (err) { return cb(err); }
            this._setCompositionField(data, field, dataToSet);
            this.updateInstance(instanceName, data, cb);
        });
    }

    _setListenerField (instanceName, listenerName, data, field, cb) {
        listenerName = this._sanitizeListenerName(listenerName);
        return this._setInstanceField(
            instanceName
          , `flow.${listenerName}${field?'.':''}${field}`
          , data
          , cb
        );
    }

    setListenerData (instanceName, listenerName, dataArr, cb) {
        return this._setListenerField(instanceName, listenerName, dataArr, "d", cb);
    }
    setErrorEvent (instanceName, listenerName, errEvent, cb) {
        return this._setListenerField(instanceName, listenerName, errEvent, "r", cb);
    }
    setEndEvent (instanceName, listenerName, endEvent, cb) {
        return this._setListenerField(instanceName, listenerName, endEvent, "e", cb);
    }
    setListener (instanceName, listenerName, listenerData, cb) {
        return this._setListenerField(instanceName, listenerName, listenerData, "", cb);
    }
    removeListener (instanceName, listenerName, cb) {
        return this._setListenerField(instanceName, listenerName, undefined, "", cb);
    }

    // TODO move styles methods to service-api.
    //      https://github.com/jillix/flow/issues/7
    setInstanceStyles (instanceName, styles, cb) {
        styles = deffy(styles, []);
        this._setInstanceField(instanceName, "config.styles", styles, cb);
    }

    // TODO move markup methpds to service-api.
    //      https://github.com/jillix/flow/issues/7
    setInstanceMarkup (instanceName, markup, cb) {
        markup = deffy(markup, []);
        this._setInstanceField(instanceName, "config.markup", markup, cb);
    }

    setInstanceLoad (instanceName, load, cb) {
        load = deffy(load, []);
        this._setInstanceField(instanceName, "config.load", load, cb);
    }

    setInstanceRoles (instanceName, roles, cb) {
        roles = deffy(roles, {});
        this._setInstanceField(instanceName, "config.roles", roles, cb);
    }

    setInstanceConfig (instanceName, config, cb) {
        config = deffy(config, {});
        this._setInstanceField(instanceName, "config.config", config, cb);
    }

    // Instance (getters)
    getInstance (instanceName, cb) {
        // .. get a complete instance configuration
    }

    getInstanceModule (instanceName, cb) {
        // .. get the module (only name?) of an instance
    }

    getInstanceRoles (instanceName, cb) {
        // .. get the roles from an instance
    }

    getInstanceListener (instanceName, listenerName, cb) {
        // .. get a complete listener config from an instance
    }

    getInstanceListenerDataFlow (instanceName, listenerName, cb) {
        // .. get the data flow from an instance listener 
    }

    getInstanceListenerEndEvent (instanceName, listenerName, cb) {
        // .. get the end event fomr a instance listener
    }

    getInstanceModuleConfig (instanceName) {
        // .. get the module config from an instance
    }
}

module.exports = FlowApi;
