'use strict'

var ctrl = require('./controller');

Parse.Cloud.define("data_articles", (request, response) => {

  ctrl.syncArticles(request, response)

});
