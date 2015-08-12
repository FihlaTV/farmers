/**
 * Created by User on 27.04.2015.
 */
var mongoose = require('mongoose');
var schema = mongoose.Schema;
var ObjectId = schema.Types.ObjectId;

module.exports = function(db){

    var lesson = new schema({
        text: String,
        taxonomyValues: [
            {
                type: ObjectId,
                ref: 'taxonomy'
            }
        ],
        postDate: {type: Date, default: Date.now}
    }, {collection: 'Lesson'});
    var lessonModel = db.model('lesson', lesson);
};