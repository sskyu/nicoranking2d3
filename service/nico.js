// @file nico.js

var _       = require('underscore');
var async   = require('async');
var http    = require('http');
var xmljson = require('xmljson');

/**
 * @class
 */
function Nico() {}

Nico.prototype = {
    /**
     * ニコニコ動画のランキング情報を取得する
     * @public
     * @param  {Object} options
     * @return {Objext}
     */
    getRanking : function getRanking(options, callback) {
        var self = this;
        var type     = options.type     || 'fav',
            category = options.category || 'all',
            period   = options.period   || 'hourly';

        async.waterfall([
            function getNicoRanking(next) {
                self._getRankingAll({
                    type     : type,
                    period   : period,
                    category : category
                }, function (err, res) {
                    next(err, res);
                });
            },
            function getNicoRankingDetail(data, next) {
                self._getRankingDetail({ data: data }, function (err, res) {
                    next(err, res);
                });
            }
        ], function (err, res) {
            if (err) {
                throw err;
            }
            callback(err, res);
        });
    },

    /**
     * 大まかなランキング情報を取得する
     * @private
     * @param  {Object}   options
     * @param  {Function} callback
     */
    _getRankingAll : function _getRankingAll(options, callback) {
        async.waterfall([
            function getXML(next) {
                var type     = options.type,
                    period   = options.period,
                    category = options.category;
                var params = {
                    host : 'www.nicovideo.jp',
                    port : 80,
                    path : '/ranking/' + type + '/' + period + '/' + category + '?rss=2.0'
                };

                http.get(params, function (response) {
                    var xml = '';
                    response.setEncoding('utf8');
                    response
                        .on('data', function (data) {
                            xml += data;
                        })
                        .on('end', function () {
                            next(null, xml);
                        });
                }).on('error', function (e) {
                    next(e);
                });
            },
            function parseJSON(xml, next) {
                xmljson.to_json(xml, function (err, json) {
                    next(err, json);
                });
            }
        ], function (err, res) {
            callback(err, res);
        });
    },

    /**
     * 動画IDをもとに動画の詳細を取得する
     * @private
     * @param  {Object}   options
     * @param  {Function} callback
     */
    _getRankingDetail : function _getRankingDetail(options, callback) {
        var items = options.data.rss.channel.item;
        var i,
            len;
        var regexp = /(sm|so)[0-9]+$/; // 正規表現をキャッシュ
        var link;
        var id,
            ids = [];
        var tasks;

        // 動画のIDを抽出する
        for (i = 0, len = 100; i < len; i++) {
            link = items[i].link;
            id   = link.match(regexp);

            if (!id) { // 動画削除されてるなどでマッチしなかったら飛ばす
                continue;
            }
            ids.push(id[0]); // match()の結果が配列で返るので0番目の要素をpushする
        }

        // task生成
        tasks = this._createDetailTask(ids);

        // タスク実行
        async.parallel(tasks, function (err, res) {
            callback(null, { ranking: res });
        });
    },

    /**
     * 動画の詳細を取得してJSONにパースするタスクを作成する
     * @private
     * @param  {Array} ids 動画IDのリスト
     * @return {Array}     XML取得からJSONへパースする一連のタスクのリスト
     */
    _createDetailTask : function _createDetailTask(ids) {
        var self  = this;
        var tasks = [];

        _.each(ids, function (id, i) {

            // TODO: ネストを浅くする
            tasks.push(function (next) {
                async.waterfall([
                    function getXML(_next) {
                        var options = {
                            host : 'ext.nicovideo.jp',
                            port : 80,
                            path : '/api/getthumbinfo/' + id
                        };
                        http.get(options, function (response) {
                            var xml = '';
                            response.setEncoding('utf8');
                            response
                                .on('data', function (data) {
                                    xml += data;
                                })
                                .on('end', function () {
                                    _next(null, xml);
                                });
                        }).on('error', function (e) {
                            _next(e);
                        });
                    },
                    function parseJSON(xml, _next) {
                        xmljson.to_json(xml, function (err, json) {
                            _next(err, json);
                        });
                    },
                    function buidObject(json, _next) {
                        var detail = json.nicovideo_thumb_response.thumb;
                        var tags   = self._parseTags(detail.tags.tag);
                        var result;

                        result = _.extend(detail, {
                            rank : i + 1,
                            tags : tags   // オブジェクトの値のみからなる配列を生成
                        });

                        _next(null, result);
                    },
                ], function (err, res) {
                    next(err, res);
                });
            });
        });

        return tasks;
    },

    /**
     * 動画のタグ情報を整形する
     * @param  {Object} tags XML->JSONした後の生のタグ情報
     * @return {Object}      使いやすく整形したタグ情報
     */
    _parseTags : function _parseTags(tags) {
        var result = [];
        var obj;
        var _tags = _.values(tags);

        _.each(_tags, function (tag) {
            obj = {};

            // tagが文字列の場合
            if (_.isString(tag)) {
                result.push({ name: tag });
                return;
            }

            if (!tag['_']) {
                return;
            }

            // tagがオブジェクトの場合
            obj.name = tag['_'];
            if (tag['$'].category) {
                obj.category = tag['$'].category;
            }
            if (tag['$'].lock) {
                obj.lock = true;
            }
            result.push(obj);
        });

        return result;
    }
};

module.exports = new Nico();