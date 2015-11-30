var CONST = require('../constants/constants');

module.exports = function (db) {
    'use strict';

    var mongoose = require('mongoose');
    var Schema = mongoose.Schema;
    var ObjectId = mongoose.Schema.Types.ObjectId;

    var Crop = new Schema({
        englishName: String,
        displayName: String,
        plantCouncilName: String,
        pcNameOptimize: String,
        pcQuality: String,
        wsQuality: String,
        wholeSaleName: String,
        wsNameOptimize: String,
        kind: String,
        varieties: String,
        type: String,
        imported: {type: Boolean, default: false},
        order: Number,
        createdAt: {type: Date, default: Date.now},
        updatedAt: {type: Date, default: Date.now},
        image: {type: String, default: null}
    }, {
        collection: CONST.MODELS.CROP + 's'
    });
    db.model(CONST.MODELS.CROP, Crop);
};