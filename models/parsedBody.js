var CONST = require('../constants/constants');

module.exports = function (db) {
    'use strict';

    var mongoose = require('mongoose');
    var Schema = mongoose.Schema;
    var ObjectId = mongoose.Schema.Types.ObjectId;

    //TODO it need  to detect and fix server crash when not JSON data received, and parse crash. Delete this in future
    var ParsedBody = new Schema({
        body: String,
        createdAt: {type: Date, default: Date.now}
    }, {
        collection: CONST.MODELS.PARSED_BODY + 's'
    });
    db.model(CONST.MODELS.PARSED_BODY, ParsedBody);
};