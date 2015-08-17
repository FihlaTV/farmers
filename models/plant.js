/**
 * Created by kille on 12.08.2015.
 */
module.exports = function (db) {
    'use strict';

    var mongoose = require('mongoose');
    var Schema = mongoose.Schema;
    var ObjectId = mongoose.Schema.Types.ObjectId;

    var Plant = new Schema({
        englishName: String,
        jewishNames: Array,
        isNewPlant: {
            type:Boolean,
            default: false
        }
    }, {
        collection: 'Plants'
    });


    db.model('Plant', Plant);


};