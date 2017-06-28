'use strict'
var iconv = require('iconv-lite');
Parse.Cloud.beforeSave('Teacher', function(request, response) {
  console.log("test", "start save")
  var object = request.object.toJSON();
  for (var variable in object) {
    if (object.hasOwnProperty(variable)) {
      let temp = object[variable].substr(object[variable].indexOf("：") + 1)
      // console.log("索引", object[variable].indexOf("："))
      request.object.set(variable, temp)

      if (variable == "major") {
        request.object.set("englishMajor", convertToPinyin(temp.trim()))
      }

      if (variable == "department") {
        request.object.set("englishDepart", convertToPinyin(temp.trim()))
      }
    }
  }
  response.success();
});

function convertToPinyin(data) {
  console.log("文字：", data)
  var result = encodeURI(data)
  console.log("en", result)
  return result
}
