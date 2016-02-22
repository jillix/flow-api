"use strict";

const EngineBuilder = require("engine-builder")
    , EntrypointManager = require("engine-entrypoint-manager")
    , findValue = require("find-value")
    , setValue = require("set-value")
    , deffy = require("deffy")
    , ul = require("ul")
    , flowPackages = require("flow-packages")
    , fuzzySearch = require("fuzzy")
    ;

class FlowApi extends EngineBuilder {
    /**
     * FlowApi
     * Creates a new instance of `FlowApi`.
     *
     * @name FlowApi
     * @function
     * @param {String|CompositionAdapter} adapter The path to the app or the composition adapter object.
     */
    constructor (adapter) {
        super(adapter);
        this.entrypoint = new EntrypointManager(this);
    }

    /**
     * addEntrypoint
     * Adds a new entrypoint.
     *
     * @name addEntrypoint
     * @function
     * @param {String} en The entrypoint name.
     * @param {Function} cb The callback function.
     */
    addEntrypoint (en, cb) {
        return this.entrypoint.create(en, cb);
    }

    /**
     * removeEntrypoint
     * Removes an existing entrypoint.
     *
     * @name removeEntrypoint
     * @function
     * @param {String} en The entrypoint name.
     * @param {Function} cb The callback function.
     */
    removeEntrypoint (en, cb) {
        return this.entrypoint.remove(en, cb);
    }

    /**
     * listEntrypoints
     * List the entrypoints.
     *
     * @name listEntrypoints
     * @function
     * @param {Function} cb The callback function.
     */
    listEntrypoints (cb) {
        return this.entrypoint.list(cb);
    }

    /**
     * updateEntrypoint
     * Updates an existing entrypoint.
     *
     * @name updateEntrypoint
     * @function
     * @param {String} oldEn The entrypoint to update.
     * @param {String} newEn The new entrypoint value.
     * @param {Function} cb The callback function.
     */
    updateEntrypoint (oldEn, newEn, cb) {
        return this.entrypoint.update(oldEn, newEn, cb);
    }

    /**
     * getModuleComposition
     * Gets the module composition.
     *
     * @name getModuleComposition
     * @function
     * @param {String} moduleName The module name.
     * @param {Function} cb The callback function.
     */
    getModuleComposition (moduleName, cb) {
        this.getModulePackage(moduleName, (err, data) => {
            if (err) { return cb(err); }
            cb(null, deffy(findValue(data, "composition"), {}), data);
        });
    }

    /*!
     * _sanitizeListenerName
     * Sanitizes the listener name.
     *
     * @name _sanitizeListenerName
     * @function
     * @param {String} name The listener name.
     * @returns {String} The sanitized listener name.
     */
    _sanitizeListenerName (name) {
        return name.replace(/\./g, "\\.");
    }

    /*!
     * _setCompositionField
     * Sets the field value in the instance.
     *
     * @name _setCompositionField
     * @function
     * @param {Object} obj The composition instance object.
     * @param {String} field The field to update.
     * @param {Anything} data The field value.
     * @returns {Object} The updated object.
     */
    _setCompositionField (obj, field, data) {
        setValue(obj, field, data);
        return obj;
    }

    /*!
     * _setInstanceField
     * Sets an instance field.
     *
     * @name _setInstanceField
     * @function
     * @param {String} instanceName The instance name.
     * @param {String} field The field to update.
     * @param {Anything} dataToSet The field value.
     * @param {Function} cb The callback function.
     */
    _setInstanceField (instanceName, field, dataToSet, cb) {
        return this.readInstance(instanceName, (err, data)  => {
            if (err) { return cb(err); }
            this._setCompositionField(data, field, dataToSet);
            this.updateInstance(instanceName, data, cb);
        });
    }

    /*!
     * _setListenerField
     * Sets the listener field.
     *
     * @name _setListenerField
     * @function
     * @param {String} instanceName The instance name.
     * @param {String} listenerName The listener name.
     * @param {Anything} data The field value.
     * @param {String} field The field to update.
     * @param {Function} cb The callback function.
     */
    _setListenerField (instanceName, listenerName, data, field, cb) {
        listenerName = this._sanitizeListenerName(listenerName);
        return this._setInstanceField(
            instanceName
          , `flow.${listenerName}${field?'.':''}${field}`
          , data
          , cb
        );
    }

    /**
     * setListenerData
     * Sets the listener data array.
     *
     * @name setListenerData
     * @function
     * @param {String} instanceName The instance name.
     * @param {String} listenerName The listener name.
     * @param {Array} dataArr The data array.
     * @param {Function} cb The callback function.
     */
    setListenerData (instanceName, listenerName, dataArr, cb) {
        return this._setListenerField(instanceName, listenerName, dataArr, "d", cb);
    }

    /**
     * setErrorEvent
     * Sets the listener error event.
     *
     * @name setErrorEvent
     * @function
     * @param {String} instanceName The instance name.
     * @param {String} listenerName The listener name.
     * @param {String} errEvent The listener error event to set.
     * @param {Function} cb The callback function.
     */
    setErrorEvent (instanceName, listenerName, errEvent, cb) {
        return this._setListenerField(instanceName, listenerName, errEvent, "r", cb);
    }

    /**
     * setEndEvent
     * Sets the listener end event.
     *
     * @name setEndEvent
     * @function
     * @param {String} instanceName The instance name.
     * @param {String} listenerName The listener name.
     * @param {String} endEvent The listener end event to set.
     * @param {Function} cb The callback function.
     */
    setEndEvent (instanceName, listenerName, endEvent, cb) {
        return this._setListenerField(instanceName, listenerName, endEvent, "e", cb);
    }

    /**
     * setListener
     * Sets the listener object.
     *
     * @name setListener
     * @function
     * @param {String} instanceName The instance name.
     * @param {String} listenerName The listener name.
     * @param {Object} listenerData The listener object.
     * @param {Function} cb The callback function.
     */
    setListener (instanceName, listenerName, listenerData, cb) {
        return this._setListenerField(instanceName, listenerName, listenerData, "", cb);
    }

    /**
     * removeListener
     * Removes the listener.
     *
     * @name removeListener
     * @function
     * @param {String} instanceName The instance name.
     * @param {String} listenerName The listener name.
     * @param {Function} cb The callback function.
     */
    removeListener (instanceName, listenerName, cb) {
        return this._setListenerField(instanceName, listenerName, undefined, "", cb);
    }

    /**
     * setInstanceStyles
     * Sets the styles.
     * **TODO**: Move styles methods to service-api. Check out [this issue](https://github.com/jillix/flow/issues/7).
     *
     * @name setInstanceStyles
     * @function
     * @param {String} instanceName The instance name.
     * @param {Array} styles The `styles` array.
     * @param {Function} cb The callback function.
     */
    setInstanceStyles (instanceName, styles, cb) {
        styles = deffy(styles, []);
        this._setInstanceField(instanceName, "config.styles", styles, cb);
    }

    /**
     * setInstanceMarkup
     * Sets the instance `markup` array.
     * **TODO**: Move styles methods to service-api. Check out [this issue](https://github.com/jillix/flow/issues/7).
     *
     * @name setInstanceMarkup
     * @function
     * @param {String} instanceName The instance name.
     * @param {Array} markup The `markup` array.
     * @param {Function} cb The callback function.
     */
    setInstanceMarkup (instanceName, markup, cb) {
        markup = deffy(markup, []);
        this._setInstanceField(instanceName, "config.markup", markup, cb);
    }

    /**
     * setInstanceLoad
     * Sets the instance `load` array.
     *
     * @name setInstanceLoad
     * @function
     * @param {String} instanceName The instance name.
     * @param {Array} load The `load` array.
     * @param {Function} cb The callback function.
     */
    setInstanceLoad (instanceName, load, cb) {
        load = deffy(load, []);
        this._setInstanceField(instanceName, "config.load", load, cb);
    }

    /**
     * setInstanceRoles
     * Sets the instance `roles` object.
     *
     * @name setInstanceRoles
     * @function
     * @param {String} instanceName The instance name.
     * @param {Object} roles The `roles` object.
     * @param {Function} cb The callback function.
     */
    setInstanceRoles (instanceName, roles, cb) {
        roles = deffy(roles, {});
        this._setInstanceField(instanceName, "config.roles", roles, cb);
    }

    /**
     * setInstanceConfig
     * Sets the instance `config` object.
     *
     * @name setInstanceConfig
     * @function
     * @param {String} instanceName The instance name.
     * @param {Object} config The config object.
     * @param {Function} cb The callback function.
     */
    setInstanceConfig (instanceName, config, cb) {
        config = deffy(config, {});
        this._setInstanceField(instanceName, "config.config", config, cb);
    }

    /**
     * setDefaultConfigInInstance
     * Merges the instance content with the `composition` field from the module `package.json`.
     *
     * @name setDefaultConfigInInstance
     * @function
     * @param {String|Object} _instanceName The instance name or content object.
     * @param {String} moduleName The module name.
     * @param {Function} cb The callback function.
     */
    setDefaultConfigInInstance (_instanceName, moduleName, cb) {
        var instanceName = _instanceName.name || _instanceName;
        if (typeof moduleName === "string" || typeof _instanceName === "string") {
            return this.readInstance(instanceName, (err, instanceData) => {
                if (err) { return cb(err); }
                this.setDefaultConfigInInstance(instanceData, instanceData.module, cb);
            });
        }
        var instanceData = _instanceName;
        this.getModuleComposition(moduleName, (err, moduleComposition) => {
            if (err) { return cb(err); }
            instanceData = ul.deepMerge(instanceData, moduleComposition);
            this.updateInstance(instanceName, instanceData, cb);
        });
    }

    /**
     * createInstanceWithDefaultConfig
     * Creates a new instance with the default config from the module.
     *
     * @name createInstanceWithDefaultConfig
     * @function
     * @param {Object} data The instance raw content as object.
     * @param {String} module The module name.
     * @param {Function} cb The callback function.
     */
    createInstanceWithDefaultConfig (data, module, cb) {
        this.createInstance(data.name, data, err => {
            if (err) { return cb(err); }
            this.setDefaultConfigInInstance(data, module, cb);
        });
    }

    static searchModules (pattern, cb) {
        debugger;
        cb(null, fuzzySearch.filter(pattern, flowPackages, {
            extract: c => {
                return `${c.name}::${c.description}`;
            }
        }));
    }
}

module.exports = FlowApi;
