/**
 * Created by User on 07.05.2015.
 */

var express = require( 'express' );
var router = express.Router();

var QuestionHandler = require('../handlers/questions');

module.exports = function(db){

    var questions = new QuestionHandler(db);

    router.get('/next', questions.getNextQuestion );

    router.post('/answer/:id', questions.sendAnswer );

    /*TODO remove*/
    /*TEST BLOCK*/
    router.get('/test/get', questions.testGetQuestions );
    router.post('/test/add/', questions.testAddQuestion );
    router.delete('/test/del/:id', questions.testDelQuestion );
    router.get('/test/get/next/:id?', questions.getNextQuestion );

    router.get('/test/answer/get', questions.testGetAnswers );
    router.delete('/test/answer/del/:id', questions.testDelAnswer );

    return router;
};
