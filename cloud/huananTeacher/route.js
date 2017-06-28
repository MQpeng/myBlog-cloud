'use strict'

var ctrl = require('./controller');
var start = true; // 莫名奇妙会触发两次
Parse.Cloud.define("data_teacher", (request, response) => {
  console.log("开始", start)

  if (start) {
    ctrl.syncTeacher(request, response)
    start = false;
  }

});
