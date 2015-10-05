var CONST = require('../constants/constants');

module.exports = function (db) {
    'use strict';

    var mongoose = require('mongoose');
    var Schema = mongoose.Schema;
    var ObjectId = mongoose.Schema.Types.ObjectId;

    var NewMarketeer = new Schema({
        user: {
            type: ObjectId,
            ref: CONST.MODELS.USER
        },
        fullName: String,
        createdAt: {type: Date, default: Date.now}
    }, {
        collection: CONST.MODELS.NEW_MARKETEER + 's'
    });
    db.model(CONST.MODELS.NEW_MARKETEER, NewMarketeer);
};