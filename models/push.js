/**
 * Created by eriy on 19.05.2015.
 */

var mongoose = require('mongoose');
var schema = mongoose.Schema;
var ObjectId = mongoose.Schema.Types.ObjectId;

module.exports = function( db ){

    var push = new schema({
        _userId: {
            type: ObjectId,
            ref: 'user',
            required: true,
            default: null
        },
        provider: {
            type: String,
            match: /APPLE/i,
            uppercase: true,
            required: true
        },
        deviceURL: {
            type: String,
            required: true
        },
        updated_at: {
            type: Date
        }
    }, {
        collection: 'Push'
    });

    push.pre('save', function( next ){
        this.updated_at = Date.now();
        next();
    });

    var pushModel = db.model('push', push);

};