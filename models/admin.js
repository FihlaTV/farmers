/**
 * Created by User on 02.06.2015.
 */

module.exports = function(db){
    'use strict';

    var mongoose = require('mongoose');
    var schema = mongoose.Schema;
    var adminModel;

    var admin = new schema({
        login: {type: String, unique: true},
        pass: String
    }, {collection: 'Admin'});

    adminModel = db.model('admin', admin);
}