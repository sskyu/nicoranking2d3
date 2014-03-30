define([
    'backbone',
    'modules/index/model/nico',
    'modules/index/view/d3',
], function (Backbone) {
    'use strict';

    // collections
    var NicoCollection = require('modules/index/model/nico');

    // views
    var D3View = require('modules/index/view/d3');

    var IndexView = Backbone.View.extend({
        initialize : function initialize() {
            var self = this;
            this._collection = new NicoCollection();

            this._d3view = null;

            this._collection.fetch({
                success : function success(collection, response, options) {
                    self._d3view = new D3View({ collection: collection });
                }
            });

            // bind events
            this.listenTo(this._collection, 'sync', this.show);
        },
        render : function render() {
            this.$el.html(this._d3view.render().$el);
            return this;
        },
        show : function show() {
            $('article').html(this.render().$el);
            this._d3view.createSVG();
        }
    });

    return IndexView;
});