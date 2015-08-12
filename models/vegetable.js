/**
 * Created by kille on 12.08.2015.
 */
module.exports = function (db) {
    'use strict';

    var mongoose = require('mongoose');
    var Schema = mongoose.Schema;
    var ObjectId = mongoose.Schema.Types.ObjectId;

    var Vegetable = new Schema({
        english_name: String,
        jewish_names: Array
    }, {
        collection: 'Vegetables'
    });


    db.model('Vegetable', Vegetable);


};