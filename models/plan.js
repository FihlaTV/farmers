/**
 * Created by User on 29.04.2015.
 */

module.exports = function (db){
    var mongoose = require('mongoose');
    var schema = mongoose.Schema;
    var ObjectId = mongoose.Types.ObjectId;

    var plan = new schema({
            refUser: { type: String, ref: 'user', default: null },
            messageType: String,
            messageId: String,
            messageTime: Number,
            time: String,
            isWeekEnd: {type: Boolean, default: false},
            lastMessage: {type: Boolean, default: false}
        }, {collection: 'Plan'});

    var planModel = db.model('plan', plan);
};