## Documentation
You can see below the API reference of this module.

### `generateModuleService(path, callback)`
Generates content for .service.json file.

#### Params
- **String** `path`: The path to the package.json file.
- **Function** `callback`: A function called with error and .serivce.json file content.

#### Return
- **Promise** A promise used to run the function steps.

### `entrypoint(username, project, instance, host, pub)`
Generates entrypoints by providing needed data.

#### Params
- **String** `username`: The username.
- **String** `project`: The project name.
- **String** `instance`: The instance name.
- **String** `host`: The host value.
- **Boolean** `pub`: A flag if the domain is public or not.

#### Return
- **String** The generated entrypoint.

### `getCompositionDir(project)`
Returns the path to the composition directory.

#### Params
- **String** `project`: The project name.

#### Return
- **String** The path to the composition directory.

### `getInstances(project, callback)`
Gets the instances of a project.

#### Params
- **String** `project`: The project name.
- **Function** `callback`: The callback function.

### `getComposition(project, callback)`
Reads the composition files and sends an object:

```js
{ "path/to/some/instance.json": { ... }
```

#### Params
- **String** `project`: The project name.
- **Function** `callback`: The callback function.

### `generateSymlinks(project, username, callback)`
Generates symlinks for a provided project.

#### Params
- **String** `project`: The project name.
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

### `projectPackPath(project)`
Returns the full path to the package.json located in the project.

#### Params
- **String** `project`: The project name.

#### Return
- **String** The path to the project package.json file.

### `getProjectPath(project)`
Returns the full path to the project directory.

#### Params
- **String** `project`: The project name.

#### Return
- **String** The full path to the project directory.

### `projectExistsSync(project)`
Checks if the project exists or not.

#### Params
- **String** `project`: The project name.

#### Return
- **Boolean** `true` if the project exists, `false` otherwise.

### `projectPack(project, callback)`
Fetches the project package.json object.

#### Params
- **String** `project`: The project name.
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
- **String** `path`: The path to the project.
- **Function** `callback`: The callback function.

#### Return
- **EngineTools** The `EngineTools` instance.

### `availableModules(app, callback)`
Fetches the available modules for a project.

#### Params
- **String** `app`: The project name.
- **Function** `callback`: The callback function.

#### Return
- **EngineTools** The `EngineTools` instance.

### `installModule(project, module, callback)`
Installs a provided module in a provided project.

#### Params
- **String** `project`: The project name.
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

### `checkNames(project, callback)`
Checks the composition file names.

#### Params
- **String** `project`: The project name.
- **Function** `callback`: The callback function.

