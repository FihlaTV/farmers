module.exports = function (db) {
    'use strict';

    var mongoose = require('mongoose');
    var Schema = mongoose.Schema;
    var ObjectId = mongoose.Schema.Types.ObjectId;

    var Plant = new Schema({
        englishName: String,
        jewishNames: Array,
        image: String,
        isNewPlant: {
            type:  Boolean,
            default: false
        }
    }, {
        collection: 'Plants'
    });


    db.model('Plant', Plant);


};