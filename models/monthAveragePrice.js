var CONST = require('../constants/constants');

module.exports = function (db) {
    'use strict';

    var mongoose = require('mongoose');
    var Schema = mongoose.Schema;
    var ObjectId = mongoose.Schema.Types.ObjectId;

    var MonthAveragePrice = new Schema({
        _crop: { type: ObjectId, ref: CONST.MODELS.CROP, default: null },
        date: Date,
        year: Number,
        month: Number,
        dayOfYear: Number,
        source: String,
        name: String,
        price: Number,
        pcQuality: String,
        wsQuality: String,
        userQuality: String,
        cropListName: String,
        _marketeer: String,
        _user: String,
        site: String,
        excellent: {type: Boolean, default: false},
        imported: {type: Boolean, default: false}
    }, {
        collection: CONST.MODELS.MONTH_AVERAGE_PRICE + 's'
    });

    db.model(CONST.MODELS.MONTH_AVERAGE_PRICE, MonthAveragePrice);
};