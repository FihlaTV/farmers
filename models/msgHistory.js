/**
 * Created by eriy on 06.05.2015.
 */
var mongoose = require('mongoose');
var schema = mongoose.Schema;
var ObjectId = schema.Types.ObjectId;

module.exports = function(db){
    'use strict';

    var msgHistory = new schema({
        userId: ObjectId,
        msgId: {type: ObjectId, ref: 'lesson'},
        msgType: {
            type: String,
            match: /A|V|L/i,
            default: 'L'
        },
        sendDate: {
            type: Date,
            default: Date.now
        }
    }, {collection:'MsgHistory'});

    var history = db.model( 'msgHistory', msgHistory );
};