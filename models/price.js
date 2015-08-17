module.exports = function (db) {
    'use strict';

    var mongoose = require('mongoose');
    var Schema = mongoose.Schema;
    var ObjectId = mongoose.Schema.Types.ObjectId;

    var Price = new Schema({
        _plant: {
            type: ObjectId,
            ref: 'Plant'
        },
        date: Date,
        year: Number,
        dayOfYear: Number,
        source: String,
        minPrice: {
            type: Number,
            default: 0
        },
        maxPrice: {
            type: Number,
            default: 0
        },
        avgPrice: {
            type: Number,
            default: 0
        }
    }, {
        collection: 'Prices'
    });

    db.model('Price', Price);
};