// @file app.js

requirejs.config({
    baseUrl : '/javascripts',  // モジュール読み込みのbaseUrlを指定する

    paths : {
        jquery : [
            '/bower_components/jquery/dist/jquery.min'
        ],

        underscore : [
            '/bower_components/underscore/underscore'
        ],

        // '/'または'http'から始まると絶対パスで参照する
        backbone : '/bower_components/backbone/backbone',

        d3 : '/bower_components/d3js/build/d3.v3.min',

        hbs : '/bower_components/require-handlebars-plugin/hbs'
    },

    shim : {
        underscore : {
            exports : '_'
        },
        d3 : {
            exports : 'd3'
        }
    }
});


define([
    'backbone',
    'modules/index/index'
], function (Backbone) {

    var IndexController = require('modules/index/index');

    var indexController = new IndexController();
    // indexController.show();
});