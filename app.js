'use strict';
var express = require('express');
var app = express();

var ParseServer = require('parse-server').ParseServer;
var Config = require('./config.json');

var api = new ParseServer(Config.parse);

// Serve the Parse API on the /parse URL prefix
app.use('/parse', api);

app.listen(2337, function() {
  console.log('parse-server-example running on port 2337.');
});
require('./cloud/main.js');

Parse.Cloud.define("test", (request, response) => {

  console.log("测试")
});
