var CONST = require('../constants/constants');

module.exports = function (db) {
    'use strict';

    var mongoose = require('mongoose');
    var Schema = mongoose.Schema;
    var ObjectId = mongoose.Schema.Types.ObjectId;

    var PriceCacheTable = new Schema({
       _id:  {type: String, index: { unique: true }},
        prices: [],
        lastDate: Date,
        updatedAt: {type: Date, default: Date.now}
    }, {
        collection: CONST.MODELS.PRICES_CACHE_TABLE + 's'
    });

    db.model(CONST.MODELS.PRICES_CACHE_TABLE, PriceCacheTable);
};