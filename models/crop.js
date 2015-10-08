var CONST = require('../constants/constants');

module.exports = function (db) {
    'use strict';

    var mongoose = require('mongoose');
    var Schema = mongoose.Schema;
    var ObjectId = mongoose.Schema.Types.ObjectId;

    var Crop = new Schema({
        englishName: String,
        displayName: String,
        wholeSaleNames: [],
        plantCouncilNames: [],
        image: String
    }, {
        collection: CONST.MODELS.CROP + 's'
    });
    db.model(CONST.MODELS.CROP, Crop);
};