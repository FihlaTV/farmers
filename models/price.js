/**
 * Created by kille on 12.08.2015.
 */
module.exports = function (db) {
    'use strict';

    var mongoose = require('mongoose');
    var Schema = mongoose.Schema;
    var ObjectId = mongoose.Schema.Types.ObjectId;

    var Price = new Schema({
        _vegetable: {
            type: ObjectId,
            ref: 'Vegetable'
        },
        maxPrice: Number,
        date: Date,
        minPrice: Number,

        avgPrice: Number
    }, {
        collection: 'Prices'
    });


    db.model('Price', Price);


};