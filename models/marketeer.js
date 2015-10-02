var CONST = require('../constants/constants');

module.exports = function (db) {
    'use strict';

    var mongoose = require('mongoose');
    var Schema = mongoose.Schema;
    var ObjectId = mongoose.Schema.Types.ObjectId;

    var Marketeer = new Schema({
        fullName: String,
        location: String,
        mergeNames: [],
        addedBy: String,
        approved: Boolean,
        logo: String,
        createdAt: {type: Date, default: Date.now},
        updatedAt: {type: Date, default: Date.now}
    }, {
        collection: CONST.MODELS.MARKETEER + 's'
    });
    db.model(CONST.MODELS.MARKETEER, Marketeer);
};