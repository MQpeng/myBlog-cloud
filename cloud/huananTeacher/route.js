'use strict'

var ctrl = require('./controller');

Parse.Cloud.define("data_teacher", (request, response) => {

  ctrl.syncTeacher(request, response)

});
