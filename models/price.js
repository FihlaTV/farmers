var CONST = require('../constants/constants');

module.exports = function (db) {
    'use strict';

    var mongoose = require('mongoose');
    var Schema = mongoose.Schema;
    var ObjectId = mongoose.Schema.Types.ObjectId;

    var Price = new Schema({
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
        cropListName: String,
        site: String,
        excellent: {type: Boolean, default: false},
        imported: {type: Boolean, default: false},
        minPrice: {type: Number, default: 0 },
        maxPrice: {type: Number, default: 0 },
        avgPrice: {type: Number, default: 0 }
    }, {
        collection: CONST.MODELS.PRICE + 's'
    });

    db.model(CONST.MODELS.PRICE, Price);
};