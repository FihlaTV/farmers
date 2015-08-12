/**
 * Created by User on 28.04.2015.
 */

module.exports = function(db){
    'use strict'
    var mongoose = require('mongoose');
    var schema = mongoose.Schema;

    var session = new schema({
        sessionId: String
    }, {collection : 'Sessions'});

    var sessionModel = db.model('session', session);
}