// @file nico.js <routes>

var async  = require('async');
var fs     = require('fs');
var moment = require('moment');

var nico = require('../service/nico');

exports.index = function(req, res){
    var fileName = './data/' + moment().format('YYMMDDHH') + '.json';

    async.waterfall([
        function isExistRankingData(next) {
            fs.exists(fileName, function (exists) {
                next(null, exists);
            });
        },
        function getRanking(isExist, next) {
            if (isExist) {
                next();
                return;
            }

            nico.getRanking({}, function (err, json) {
                var _json = JSON.stringify(json);
                fs.writeFile(fileName, _json, function (err) {
                    if (err) {
                        console.log(err);
                    }
                    next();
                });
            });
        },
        function readRankingJSON(next) {
            fs.readFile(fileName, 'utf8', function (err, text) {
                next(err, text);
            });
        }
    ], function (err, result) {
        if (err) {
            throw err;
        }
        var json = JSON.parse(result);

        res.json(json);
    });
};