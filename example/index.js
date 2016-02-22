const FlowApi = require("../lib");

var fa = new FlowApi("path/to/app");

// Read some instance
fa.readInstance("foo", (err, data) => {
    console.log(err, data);
    /* do something with the "foo" instance */
});

FlowApi.searchModules("html", function (err, data) {
    console.log(err || data);
});
// [ { string: 'view::Render HTML templates',
//     score: 26,
//     index: 2,
//     original:
//      { name: 'view',
//        version: '0.1.0',
//        description: 'Render HTML templates',
//        ...
//        _id: 'view@0.1.0' } } ]
