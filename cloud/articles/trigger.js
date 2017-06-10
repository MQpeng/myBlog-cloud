'use strict'

Parse.Cloud.beforeSave('Articles', function(request, response) {
  console.log("test", "start save")
  response.success();
});
