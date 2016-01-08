# flow-api

The flow api library and CLI app.

## Installation

```sh
$ npm i --save flow-api
```

## Example

```js
const FlowApi = require("flow-api");

var fa = new FlowApi("path/to/app");

// Read some instance
fa.readInstance("foo", (err, data) => {
    console.log(err, data);
    /* do something with the "foo" instance */
});
```

## Documentation

### `FlowApi(adapter)`
Creates a new instance of `FlowApi`.

#### Params
- **String|CompositionAdapter** `adapter`: The path to the app or the composition adapter object.

### `addEntrypoint(en, cb)`
Adds a new entrypoint.

#### Params
- **String** `en`: The entrypoint name.
- **Function** `cb`: The callback function.

### `removeEntrypoint(en, cb)`
Removes an existing entrypoint.

#### Params
- **String** `en`: The entrypoint name.
- **Function** `cb`: The callback function.

### `listEntrypoints(cb)`
List the entrypoints.

#### Params
- **Function** `cb`: The callback function.

### `updateEntrypoint(oldEn, newEn, cb)`
Updates an existing entrypoint.

#### Params
- **String** `oldEn`: The entrypoint to update.
- **String** `newEn`: The new entrypoint value.
- **Function** `cb`: The callback function.

### `getModuleComposition(moduleName, cb)`
Gets the module composition.

#### Params
- **String** `moduleName`: The module name.
- **Function** `cb`: The callback function.

### `setListenerData(instanceName, listenerName, dataArr, cb)`
Sets the listener data array.

#### Params
- **String** `instanceName`: The instance name.
- **String** `listenerName`: The listener name.
- **Array** `dataArr`: The data array.
- **Function** `cb`: The callback function.

### `setErrorEvent(instanceName, listenerName, errEvent, cb)`
Sets the listener error event.

#### Params
- **String** `instanceName`: The instance name.
- **String** `listenerName`: The listener name.
- **String** `errEvent`: The listener error event to set.
- **Function** `cb`: The callback function.

### `setEndEvent(instanceName, listenerName, endEvent, cb)`
Sets the listener end event.

#### Params
- **String** `instanceName`: The instance name.
- **String** `listenerName`: The listener name.
- **String** `endEvent`: The listener end event to set.
- **Function** `cb`: The callback function.

### `setListener(instanceName, listenerName, listenerData, cb)`
Sets the listener object.

#### Params
- **String** `instanceName`: The instance name.
- **String** `listenerName`: The listener name.
- **Object** `listenerData`: The listener object.
- **Function** `cb`: The callback function.

### `removeListener(instanceName, listenerName, cb)`
Removes the listener.

#### Params
- **String** `instanceName`: The instance name.
- **String** `listenerName`: The listener name.
- **Function** `cb`: The callback function.

### `setInstanceStyles(instanceName, styles, cb)`
Sets the styles.

#### Params
- **String** `instanceName`: The instance name.
- **Array** `styles`: The `styles` array.
- **Function** `cb`: The callback function.

### `setInstanceMarkup(instanceName, markup, cb)`
Sets the instance `markup` array.

#### Params
- **String** `instanceName`: The instance name.
- **Array** `markup`: The `markup` array.
- **Function** `cb`: The callback function.

### `setInstanceLoad(instanceName, load, cb)`
Sets the instance `load` array.

#### Params
- **String** `instanceName`: The instance name.
- **Array** `load`: The `load` array.
- **Function** `cb`: The callback function.

### `setInstanceRoles(instanceName, roles, cb)`
Sets the instance `roles` object.

#### Params
- **String** `instanceName`: The instance name.
- **Object** `roles`: The `roles` object.
- **Function** `cb`: The callback function.

### `setInstanceConfig(instanceName, config, cb)`
Sets the instance `config` object.

#### Params
- **String** `instanceName`: The instance name.
- **Object** `config`: The config object.
- **Function** `cb`: The callback function.

### `setDefaultConfigInInstance(_instanceName, moduleName, cb)`
Merges the instance content with the `composition` field from the module `package.json`.

#### Params
- **String|Object** `_instanceName`: The instance name or content object.
- **String** `moduleName`: The module name.
- **Function** `cb`: The callback function.

### `createInstanceWithDefaultConfig(data, module, cb)`
Creates a new instance with the default config from the module.

#### Params
- **Object** `data`: The instance raw content as object.
- **String** `module`: The module name.
- **Function** `cb`: The callback function.

## How to contribute
Have an idea? Found a bug? See [how to contribute][contributing].

## Where is this library used?
If you are using this library in one of your projects, add it in this list. :sparkles:

## License

[MIT][license] © [jillix][website]

[license]: http://showalicense.com/?fullname=jillix%20%3Ccontact%40jillix.com%3E%20(http%3A%2F%2Fjillix.com)&year=2015#license-mit
[website]: http://jillix.com
[contributing]: /CONTRIBUTING.md
[docs]: /DOCUMENTATION.md