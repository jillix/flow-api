var EngineTools = require("../lib");

EngineTools.availableModules("service", function (err, mods) {
    console.log(mods);
});
