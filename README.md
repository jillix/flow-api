# Engine Tools
Engine Tools library and CLI app.

## Installation

```sh
$ npm install -g engine-tools
```

## CLI Usage
```sh
$ engine-tools generateModuleService <optional-path-to-package.json>
```

## Documentation
### `generateModuleService(path, callback)`
Generates content for .service.json file.

#### Params
- **String** `path`: The path to the package.json file.
- **Function** `callback`: A function called with error and .serivce.json file content.

#### Return
- **Promise** A promise used to run the function steps.

#### `entrypoint(username, project, instance, host, pub)`
Generates entrypoints by providing needed data.

##### Params
- **String** `username`: The username.
- **String** `project`: The project name.
- **String** `instance`: The instance name.
- **String** `host`: The host value.
- **Boolean** `pub`: A flag if the domain is public or not.

##### Return
- **String** The generated entrypoint.

#### `generateSymlinks(project, username, callback)`
Generates symlinks for a provided project.

##### Params
- **String** `project`: The project name.
- **String** `username`: The username.
- **Function** `callback`: The callback function.

##### Return
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


## How to contribute
1. File an issue in the repository, using the bug tracker, describing the
   contribution you'd like to make. This will help us to get you started on the
   right foot.
2. Fork the project in your account and create a new branch:
   `your-great-feature`.
3. Commit your changes in that branch.
4. Open a pull request, and reference the initial issue in the pull request
   message.

## License
See the [LICENSE](./LICENSE) file.
