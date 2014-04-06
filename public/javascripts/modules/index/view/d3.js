// @file d3.js <modules/index/view>

define([
    'backbone',
    'd3',
    'hbs!modules/index/hbs/index'
], function (
    Backbone,
    d3,
    hbsIndex
) {
    'use strict';

    var D3View = Backbone.View.extend({
        className : 'd3-main',

        render : function render() {
            this.$el.html(hbsIndex({}));
            return this;
        },

        /**
         * SVGを作成する
         * this.$elをDOMツリーに追加後実行すること
         * @public
         */
        createSVG : function createSVG() {
            // データ
            var dataset  = this._parseData();
            var baseType = 'mylist';  // グラフ描画に使うデータを指定する

            // 定数
            var w = 500,
                h = 1500,
                barPadding = 4,
                wPadding = 30,
                hPadding = 10,
                len = dataset.length;

            // svg生成
            var svg = d3.select('.d3-svgWrapper').append('svg')
                .attr('width', w)
                .attr('height', h);

            // scale生成
            var wScale = d3.scale.linear()
                .domain([0, d3.max(dataset, function (d) {
                    return d[baseType];
                })])
                .range([0, w - (wPadding * 2)]);

            // グラフ描画
            svg.selectAll('rect')
                .data(dataset)
                .enter()
                .append('rect')
                .attr('x', wPadding)
                .attr('y', function (d, i) {
                    return i * ((h - hPadding) / len) + hPadding;
                })
                .attr('width', function (d) {
                    return wScale(d[baseType]);
                })
                .attr('height', h / len - barPadding)
                .attr('fill', 'teal');

            // rank描画
            svg.selectAll('text')
                .data(dataset)
                .enter()
                .append('text')
                .text(function (d) {
                    return d.rank;
                })
                .attr('x', 0)
                .attr('y', function (d, i) {
                    // TODO: 位置調整するカオスな数式を可読性高くする
                    return i * ((h - hPadding) / len) + hPadding + (h / len - hPadding) + barPadding;
                })
                .attr('class', 'd3-bar-rank');
        },

        /**
         * collectionから描画に必要なデータを抽出して返す
         * 単にtoJSON()して返すとデータ量多そうなので取捨選択する
         * @return {Array}
         */
        _parseData : function _parseData() {
            var dataset = [];

            _.each(this.collection.models, function (model) {
                var data = {};

                data.mylist = model.get('mylist_counter');
                data.view   = model.get('view_counter');
                data.comment = model.get('comment_num');
                data.rank   = model.get('rank');
                data.title  = model.get('title');

                dataset.push(data);
            }, this);

            return dataset;
        }
    });

    return D3View;
});