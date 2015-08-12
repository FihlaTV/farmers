/**
 * Created by eriy on 14.05.2015.
 */
var mongoose = require('mongoose');
var schema = mongoose.Schema;
var ObjectId = schema.Types.ObjectId;

module.exports = function(db){

    var taxonomy = new schema({
        taxonomyName: {
            type: String,
            required: true
        },
        value: {
            type: String,
            required: true
        },
        lvl: {
            type: Number,
            required: true,
            min: 1,
            max: 3
        },
        postDate: {type: Date, default: Date.now}
    }, {collection: 'Taxonomy'});
    var taxonomyModel = db.model( 'taxonomy', taxonomy );
};