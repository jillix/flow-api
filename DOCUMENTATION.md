## Documentation
You can see below the API reference of this module.

### `generateModuleService(path, callback)`
Generates content for .service.json file.

#### Params
- **String** `path`: The path to the package.json file.
- **Function** `callback`: A function called with error and .serivce.json file content.

#### Return
- **Promise** A promise used to run the function steps.

### `entrypoint(username, app, instance, host, pub)`
Generates entrypoints by providing needed data.

#### Params
- **String** `username`: The username.
- **String** `app`: The app name.
- **String** `instance`: The instance name.
- **String** `host`: The host value.
- **Boolean** `pub`: A flag if the domain is public or not.

#### Return
- **String** The generated entrypoint.

### `getCompositionDir(app)`
Returns the path to the composition directory.

#### Params
- **String** `app`: The app name.

#### Return
- **String** The path to the composition directory.

### `getInstances(app, callback)`
Gets the instances of a app.

#### Params
- **String** `app`: The app name.
- **Function** `callback`: The callback function.

### `getInstance(app, instanceName, callback)`
Gets the specified instance.

#### Params
- **String** `app`: The app name.
- **String** `instanceName`: The instance name.
- **Function** `callback`: The callback function.

### `getComposition(app, options, callback)`
Reads the composition files and sends an object:

```js
{ "path/to/some/instance.json": { ... }
```

#### Params
- **String** `app`: The app name.
- **Object** `options`: An object containing:
 - `iName` (Boolean): If `true`, the instance name will be used instead of path name.
- **Function** `callback`: The callback function.

### `generateSymlinks(app, username, callback)`
Generates symlinks for a provided app.

#### Params
- **String** `app`: The app name.
- **String** `username`: The username.
- **Function** `callback`: The callback function.

#### Return
- **EngineTools** The `EngineTools` instance.

### `packPath(path)`
Returns the full path to the package.json located into `path`.

#### Params
- **String** `path`: The path to the directory containing the package.json file.

#### Return
- **String** The path to the package.json.

### `appPackPath(app)`
Returns the full path to the package.json located in the app.

#### Params
- **String** `app`: The app name.

#### Return
- **String** The path to the app package.json file.

### `getAppPath(app)`
Returns the full path to the app directory.

#### Params
- **String** `app`: The app name.

#### Return
- **String** The full path to the app directory.

### `appExistsSync(app)`
Checks if the app exists or not.

#### Params
- **String** `app`: The app name.

#### Return
- **Boolean** `true` if the app exists, `false` otherwise.

### `appPack(app, callback)`
Fetches the app package.json object.

#### Params
- **String** `app`: The app name.
- **Function** `callback`: The callback function.

#### Return
- **EngineTools** The `EngineTools` instance.

### `modulePack(app, mod, callback)`
Reads the module package.json.

#### Params
- **String** `app`: The app name.
- **String** `mod`: The module name.
- **Function** `callback`: The callback function.

#### Return
- **EngineTools** The `EngineTools` instance.

### `getNpmModules(callback)`
Fetches the Engine modules from NPM.

#### Params
- **Function** `callback`: The callback function.

#### Return
- **EngineTools** The `EngineTools` instance.

### `isEngineModule(input, callback)`
Checks if the input is an Engine module.

Usage

```js
// Path to the module directory
EngineTools.isEngineModule("path/to/node_modules/foo", function (isEngineModule, pack) {
   // do something
});

// Path to the package.json
EngineTools.isEngineModule("path/to/node_modules/foo/package.json", function (isEngineModule, pack) {
   // do something
});

// Some object
EngineTools.isEngineModule({
   keywords: ["jxengine"]
}, function (isEngineModule, pack) {
   // do something
});
```

#### Params
- **String|Object** `input`: A string representing the path to a directory containing the package.json file or even to the package.json file or the package object itself.
- **Function** `callback`: The callback function called with two parameters: a boolean value (`true` if the provided input is an Engine module) and the package object.

#### Return
- **EngineTools** The `EngineTools` instance.

### `appModules(path, callback)`
Fetches the installed Engine modules.

#### Params
- **String** `path`: The path to the app.
- **Function** `callback`: The callback function.

#### Return
- **EngineTools** The `EngineTools` instance.

### `availableModules(app, callback)`
Fetches the available modules for a app.

#### Params
- **String** `app`: The app name.
- **Function** `callback`: The callback function.

#### Return
- **EngineTools** The `EngineTools` instance.

### `installModule(app, module, callback)`
Installs a provided module in a provided app.

#### Params
- **String** `app`: The app name.
- **String** `module`: The module to install (can be a npm module name or a git url).
- **Function** `callback`: The callback function.

#### Return
- **EngineTools** The `EngineTools` instance.

### `linkData(callback)`
Generates a wrapper function for `link.data`.

#### Params
- **Function** `callback`: The callback function called with error and data.

#### Return
- **Function** The wrapper function.

### `checkNames(app, callback)`
Checks the composition file names.

#### Params
- **String** `app`: The app name.
- **Function** `callback`: The callback function.

### `nameFromInstancePath(path)`
Gets the instance name by providing the path.

#### Params
- **String** `path`: The instance path.

#### Return
- **String** The instance name.

### `setNames(app, callback)`
Sets the instance names using the file names.

#### Params
- **String** `app`: The app name.
- **Function** `callback`: The callback function.

### `getInstancePath(app, instance)`
Gets the instance path.

#### Params
- **String** `app`: The application name.
- **Object|String** `instance`: The instance object or name.

#### Return
- **String** The instance path.

### `saveInstance(app, instance, callback)`
Saves the instance object in the file.

#### Params
- **String** `app`: The application name.
- **Object|String** `instance`: The instance object or name.
- **Function** `callback`: The callback function.

### `deleteInstance(app, instance, callback)`
Delets the instance from the file system.

#### Params
- **String** `app`: The application name.
- **Object|String** `instance`: The instance object or name.
- **Function** `callback`: The callback function.

### `getServicePath(app, mod)`
Builds the path to the .service.json file.

#### Params
- **String** `app`: The app name.
- **String** `mod`: The module name.

#### Return
- **String** The .service.json file path.

### `getService(app, mod, callback)`
Reads the .service.json file.

#### Params
- **String** `app`: The app name.
- **String** `mod`: The module name.
- **Function** `callback`: The callback function.

### `getService(app, mod, data, callback)`
setService
Writes the .service.json file.

#### Params
- **String** `app`: The app name.
- **String** `mod`: The module name.
- **Object** `data`: The data to write.
- **Function** `callback`: The callback function.

### `getModuleInfo(app, mod, callback)`
Gets the module information.

#### Params
- **String** `app`: The app name.
- **String** `mod`: The module name.
- **Function** `callback`: The callback function.

