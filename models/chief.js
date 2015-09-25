module.exports = function (db) {
    'use strict';

    var mongoose = require('mongoose');
    var Schema = mongoose.Schema;
    var ObjectId = mongoose.Schema.Types.ObjectId;

    var Chief = new Schema({
        email: String,
        pass: String,
        login: String,
        createdAt: {type: Date, default: Date.now},
        updatedAt: {type: Date, default: Date.now}
    }, {
        collection: 'Chiefs'
    });
    db.model('Chief', Chief);
};