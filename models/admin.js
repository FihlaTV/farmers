module.exports = function (db) {
    'use strict';

    var mongoose = require('mongoose');
    var Schema = mongoose.Schema;
    var ObjectId = mongoose.Schema.Types.ObjectId;

    var Admin = new Schema({
        email: String,
        pass: String,
        fullName: String,
        login: String,
        changePassToken: String,
        createdAt: {type: Date, default: Date.now},
        updatedAt: {type: Date, default: Date.now}
    }, {
        collection: 'Admins'
    });
    db.model('Admin', Admin);
};