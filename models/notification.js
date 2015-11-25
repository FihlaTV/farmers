var CONST = require('../constants/constants');

module.exports = function (db) {
    'use strict';

    var mongoose = require('mongoose');
    var Schema = mongoose.Schema;
    var ObjectId = mongoose.Schema.Types.ObjectId;

    var Notification = new Schema({
        user: {
            type: ObjectId,
            ref: CONST.MODELS.USER
        },
        type: String, //newMarketeer | changeMarketeer | newCrop |
        marketeerName: String,
        oldMarketeerName: String,
        newCropPriceId:  {
            type: ObjectId,
            ref: CONST.MODELS.PRICE
        },
        cropName: String,
        source: String,

        createdAt: {type: Date, default: Date.now}
    }, {
        collection: CONST.MODELS.NOTIFICATION + 's'
    });
    db.model(CONST.MODELS.NOTIFICATION, Notification);
};