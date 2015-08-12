/**
 * Created by User on 07.05.2015.
 */

module.exports = function(db){
    var mongoose = require('mongoose');
    var schema = mongoose.Schema;
    var ObjectId = schema.Types.ObjectId;
    var answerModel;

    var answer = new schema({
        _userId: { type: ObjectId, ref: 'user', required:true, default: null },
        _questionId: { type: ObjectId, ref: 'question', required:true, default: null },
        answer: String //todo change type answer (date, text,...)

    }, {collection: 'Answers'});

    answerModel = db.model('answer', answer);
};