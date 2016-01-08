const FlowApi = require("../lib");

var fa = new FlowApi("path/to/app");

// Read some instance
fa.readInstance("foo", (err, data) => {
    console.log(err, data);
    /* do something with the "foo" instance */
});
