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
        confirmToken: String
    }, {
        collection: 'Users'
    });
    db.model('User', User);
};