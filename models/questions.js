/**
 * Created by eriy on 07.05.2015.
 */
module.exports = function( db ){
    var mongoose = require('mongoose');
    var schema = mongoose.Schema;

    var question = new schema({

        text: String,
        required: {
            type: Boolean,
            default: true
        },
        potentialAnswers: {type: String, default: null},
        active: {
            type: Boolean,
            default: true
        },
        queueNumber: Number,
        type: {
            type:String,
            match: /DATE|TEXT|NUMBER|RADIO/i
        },
        postDate: {type: Date, default: Date.now}

    }, {collection: 'Questions'});

    var lessonModel = db.model('question', question);
};