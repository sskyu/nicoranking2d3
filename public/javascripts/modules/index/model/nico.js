define(['backbone'], function (Backbone) {
    'use strict';

    var NicoModel = Backbone.Model.extend({
        parse : function (data) {
            // 値が文字列だとd3でうまく扱えないので数値型に変換しておく
            data.mylist_counter = Number(data.mylist_counter);
            data.view_counter   = Number(data.view_counter);
            data.comment_num    = Number(data.comment_num);
            return data;
        }
    });

    var NicoCollection = Backbone.Collection.extend({
        model : NicoModel,
        url   : '/nico',
        parse : function parse(json) {
            return json.ranking;
        }
    });

    return NicoCollection;
});