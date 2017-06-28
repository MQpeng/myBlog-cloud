'use strict'

var http = require('http')
var cheerio = require('cheerio')
var Promise = require('bluebird')
var fs = require('fs')
var iconv = require('iconv-lite');
var BufferHelper = require('bufferhelper');
var urlencode = require('urlencode');

var baseUrl = 'http://202.38.194.239/yanzhao/2017zsjz/ss/index.asp';
var secondeBaseUrl = 'http://202.38.194.239/yanzhao/daoshi/showdetail2.asp?xm=';
var TEACHERDATA = [];

function getPageAsync(url) {
  return new Promise(function(resolve, reject) {
    console.log("正在爬取" + url);
    http.get(url, function(res) {
      var bufferHelper = new BufferHelper();
      res.on('data', function(data) {
        bufferHelper.concat(data);
      })
      res.on('end', function() {
        resolve({
          html: iconv.decode(bufferHelper.toBuffer(), 'GBK'),
          url: url
        });
      })
    }).on('error', function(e) {
      reject(e);
      console.log('爬取出错');
    })
  }).catch(function(error) {
    console.log('爬取出错', error);
  });
}

function analyseHtml(data) {
  fs.writeFile('input.html', data, function(err) {
    if (err) {
      console.log('错误:', err);
    }
    console.log('结束:');
  });
}

function getTeacherDataUrl(html) {
  return new Promise(function(resolve, reject) {
    var $ = cheerio.load(html);
    var tables = $("table");
    var herfs = $(tables[1]).find("tr td a[title='点击导师姓名查看该导师详细简介']");
    // console.log(herfs)
    var teachersData = [];
    herfs.each((i, item) => {
      var obj = {};
      var temp = $(item).attr("href").substr(32);
      obj.herf = temp.substr(temp.indexOf('&'));
      obj.name = $(item).text();
      teachersData.push(obj);
    })
    // console.log(teachersData)
    resolve(teachersData)
  })
}

function getTeacherData(datas, start, datasLength) {
  var test = []
  for (let i = 0; i < 25; i++) {
    let j = i + start
    if (j >= datasLength)
      break;
    console.log('进来了' + j, datasLength)
    test[i] = getPageAsync(secondeBaseUrl + urlencode(datas[j].name, 'gbk') + datas[j].herf)
  }
  return Promise.all(test)
    .then((value) => {
      value.forEach(data => {
        var teachTemp = [];
        var teacherObject = {};
        var $ = cheerio.load(data.html);
        var tds = $($("table")[1]).find("tr td[class='f10']");
        tds.each((i, item) => {
          teachTemp.push($(item).text());
        })
        teacherObject.name = teachTemp[0];
        teacherObject.sex = teachTemp[2];
        teacherObject.situation = teachTemp[3];
        teacherObject.major = teachTemp[4];
        teacherObject.level = teachTemp[5];
        teacherObject.department = teachTemp[6];
        teacherObject.target = teachTemp[7];
        teacherObject.email = teachTemp[9];
        teacherObject.url = data.url;
        TEACHERDATA.push(teacherObject)
      })
      if (value.length == 25) {
        getTeacherData(datas, start + 25, datasLength)
      } else {
        savaAllToMongo("Teacher", TEACHERDATA);
      }
      console.log(datas.length + "-----------" + start + "------------" + value.length)
    })
}

function saveDataToMongo() {
  console.log(TEACHERDATA)
}

function savaAllToMongo(className, DATAS) {
  var Class = Parse.Object.extend(className);
  var subClass = new Class();
  // console.log("测试：", datas);
  let p1 = subClass.set(DATAS[0]).save();
  Parse.Promise.when(p1).then((oneData) => {
    // console.log("同步完成第一条数据---数据--->", oneData);
    var count = 1;
    DATAS.forEach((value) => {
      if (value == DATAS[0]) {
        return true;
      }
      let subClass = new Class();
      subClass.set(value).save()
        .then((data) => {
          console.log(DATAS.length + "保存成功---------数据量------>", ++count);
        });
    });
  })

}

function getOptions(html) {
  var $ = cheerio.load(html);
  var tables = $("table");
  // analyseHtml($(tables[0]).text())
  var zydmt = $(tables[0]).find("select[name='zydmt'] option")
  var majorsOptions = [];
  zydmt.each((i, item) => {
    majorsOptions.push({
      options: $(item).text()
    });
  })
  console.log(majorsOptions)
  savaAllToMongo("majorsOptions", majorsOptions)
  var departmentOptions = [];
  var yxsmt = $(tables[0]).find("select[name='yxsmt'] option")
  yxsmt.each((i, item) => {
    departmentOptions.push({
      options: $(item).text()
    });
  })
  console.log(departmentOptions)
  savaAllToMongo("departmentOptions", departmentOptions)
}

exports.syncTeacher = (request, response) => {
  console.log("test", "contrlor")
  getPageAsync(baseUrl)
    .then((data) => {
      // getOptions(data.html)
      return getTeacherDataUrl(data.html)
    })
    .then((data) => {
      return getTeacherData(data, 0, data.length)
    })

}
