/**
 * Created by kille on 12.08.2015.
 */
module.exports = function (db) {
    'use strict';

    var mongoose = require('mongoose');
    var Schema = mongoose.Schema;
    var ObjectId = mongoose.Schema.Types.ObjectId;

    var Price = new Schema({
        _id: Number,
        _vegetable: {
            type: ObjectId,
            ref: 'vegetable'
        },
        date: Date,
        min_price: Number,
        max_price: Number,
        avg_price: Number
    }, {
        collection: 'Prices'
    });


    db.model('Price', Price);


};