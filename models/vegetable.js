/**
 * Created by kille on 12.08.2015.
 */
module.exports = function (db) {
    'use strict';

    var mongoose = require('mongoose');
    var Schema = mongoose.Schema;
    var ObjectId = mongoose.Schema.Types.ObjectId;

    var Vegetable = new Schema({
        englishName: String,
        jewishNames: Array,
        isNewVeg: {
            type:Boolean,
            default: false
        }
    }, {
        collection: 'Vegetables'
    });


    db.model('Vegetable', Vegetable);


};