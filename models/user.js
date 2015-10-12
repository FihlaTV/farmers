var CONST = require('../constants/constants');

module.exports = function (db) {
    'use strict';

    var mongoose = require('mongoose');
    var Schema = mongoose.Schema;
    var ObjectId = mongoose.Schema.Types.ObjectId;

    var User = new Schema({
        email: String,
        pass: String,
        fullName: String,
        favorites:[],
        changePassToken: String,
        fbId: String,
        avatar: String,
        confirmToken: String,
        marketeer: {type: ObjectId, ref: CONST.MODELS.MARKETEER, default: null},
        canChangeMarketeer:  {type: Boolean, default: true},
        newMarketeer:  {type: Boolean, default: false},
        createdAt: {type: Date, default: Date.now},
        updatedAt: {type: Date, default: Date.now}
    }, {
        collection: CONST.MODELS.USER + 's'
    });
    db.model(CONST.MODELS.USER, User);
};