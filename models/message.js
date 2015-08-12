/**
 * Created by User on 27.04.2015.
 */
var mongoose = require('mongoose');
var schema = mongoose.Schema;

module.exports = function(db){
    'use strict'

    var messageHistory = new schema({
        userId: String,
        messageId: String
    },{collection:'History'});
};