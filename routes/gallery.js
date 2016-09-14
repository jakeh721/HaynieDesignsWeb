var express = require('express');
var router = express.Router();
var fs = require('fs');
var path = require('path');
var async = require('async');
var AWS = require('aws-sdk');
var settings = require('../settings.json');

AWS.config.region = 'us-west-2';
AWS.config.update({accessKeyId: settings.aws.id, secretAccessKey: settings.aws.key});
var s3 = new AWS.S3();

router.get('/', function(req, res, next) {
  var params = {
    Bucket: 'hayniephotos',
    Prefix: 'Sand Rails/'
  };
  async.waterfall([
    function(cb) {
      var list = [];
      s3.listObjects(params, function(err, data) {
        if (err) {
          console.log(err, err.stack);
        } else {
          data.Contents.name = "Sand Rails";
          data.Contents.count = data.Contents.length;
          list.push(data.Contents);
          cb(null, list);
        }
      });
    },
    function(list, cb) {
      params.Prefix = "Vehicles"
      s3.listObjects(params, function(err, data) {
        if (err) {
          console.log(err, err.stack);
        } else {
          data.Contents.name = "Vehicles";
          data.Contents.count = data.Contents.length;
          list.push(data.Contents);
          cb(null, list);
        }
      });
    },
    function(list, cb) {
      params.Prefix = "Helmets"
      s3.listObjects(params, function(err, data) {
        if (err) {
          console.log(err, err.stack);
        } else {
          data.Contents.name = "Helmets";
          data.Contents.count = data.Contents.length;
          list.push(data.Contents);
          cb(null, list);
        }
      });
    },
    function(list, cb) {
      params.Prefix = "Misc"
      s3.listObjects(params, function(err, data) {
        if (err) {
          console.log(err, err.stack);
        } else {
          data.Contents.name = "Misc";
          data.Contents.count = data.Contents.length;
          list.push(data.Contents);
          cb(null, list);
        }
      });
    }
  ], function(err, result) {
    // console.log(err || result);
    res.locals.result = result;
    res.render('pages/gallery');
  });
});

module.exports = router;