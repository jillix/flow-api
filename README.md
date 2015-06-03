# Engine Tools
Engine Tools library and CLI app.

## Installation

```sh
$ npm install -g engine-tools
```

## CLI Usage

```sh
$ engine-tools -h
Usage: engine-tools [options]

Options:
  -h, --help             Displays this help.
  -v, --version          Displays version information.
  -m, --method <method>  The method to run.
  -a, --args <args>      The arguments passed to the provided method.
  -l, --list             List the available methods.

Examples:
  engine-tools -m projectPack -a foo # Get the package.json of foo
  engine-tools -m installModule -a "foo bar" # Install bar in foo
  engine-tools -l # list available methods

Make sure that you read the jillix Engine docs.
This tool uses the $ENGINE_APPS env variable
representing the absolute path to the Engine apps directory.

Documentation can be found at https://github.com/jillix/engine-tools
```

## Documentation
See the [DOCUMENTATION.md file](/DOCUMENTATION.md).

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
