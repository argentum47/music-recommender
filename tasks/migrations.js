var process = require('process');
var path = require("path");

var migrationName = process.argv[2];

console.log(migrationName);
require(path.join(__dirname, migrationName));