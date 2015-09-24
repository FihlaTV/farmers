/**
 * Created by kille on 12.08.2015.
 */
module.exports = function (db) {
    'use strict';

    var mongoose = require('mongoose');
    var Schema = mongoose.Schema;
    var ObjectId = mongoose.Schema.Types.ObjectId;

    var User = new Schema({
        email: String,
        pass: String,
        fullName: String,
        favorites:[]
    }, {
        collection: 'Users'
    });
    db.model('User', User);
};