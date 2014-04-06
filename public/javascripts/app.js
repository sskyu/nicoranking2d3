// @file app.js

requirejs.config({
    baseUrl : '/javascripts',  // モジュール読み込みのbaseUrlを指定する

    paths : {
        jquery : '/bower_components/jquery/dist/jquery.min',

        underscore : '/bower_components/underscore/underscore',

        backbone : '/bower_components/backbone/backbone',

        // d3js, moduleIDは d3 とした
        d3 : '/bower_components/d3js/build/d3.v3.min',

        hbs : '/bower_components/require-handlebars-plugin/hbs',
    },

    shim : {
        underscore : {
            exports : '_'
        },
        // d3としてグローバル変数に追加する
        d3 : {
            exports : 'd3'
        },
    },

    hbs : {
        helperPathCallback : function (name) {
            return 'core/helpers/' + name;
        },
    }
});


define([
    'backbone',
    'modules/index/index'
], function (Backbone) {

    var IndexController = require('modules/index/index');

    var indexController = new IndexController();
});