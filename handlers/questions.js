/**
 * Created by User on 07.05.2015.
 */
var mongoose = require('mongoose');
var ObjectId = mongoose.Types.ObjectId;

var Questions = function(db){
    var Questions = db.model('question');
    var User = db.model('user');
    var Answer = db.model('answer');


    function getAnswered(userId, callback ) {
        var Answers = db.model('answer'); //todo move to top

        Answers.aggregate([
            { $match: {_userId: ObjectId( userId )}},
            { $group:
                {
                    _id: null,
                    answered: {
                        $addToSet: "$_questionId"
                    }
                }
            },
            { $project:
                {
                    _id: 0,
                    answered: 1
                }
            }
        ]
        , function (err, result) {
            if (err) {
                return callback(err);
            }
            if ( result.length ) {
                return callback(null, result[0].answered);
            }
            callback(null, []);
        } )
    };

    function getQuestion( userId, callback ) {
        var Questions = db.model('question'); // todo move top

        getAnswered( userId, function(err, answeredIds) {
            if (err) {
                return callback( err );
            }

            Questions
                .find(
                    {
                        active: true,
                        required: true,
                        _id: { $nin: answeredIds }
                    },
                    {
                        '__v': 0,
                        'active': 0,
                        'required': 0
                    }
                )
                .sort( { queueNumber:1 } )
                .limit(1)
                .exec( callback )
        })
    }

    this.getNextQuestion = function ( req, res, next ) {
        var userId = req.session.uId || req.params.id;
        var returnObj;

        getQuestion( userId, function (err, question) {
            if ( err ) {
                return next(err);
            }

            if (!question.length){
                returnObj = {};
            } else {
                returnObj = question[0].toObject();
            }

            if ( returnObj.type === 'RADIO' && returnObj.potentialAnswers ){
                returnObj.potentialAnswers = returnObj.potentialAnswers.split(',');
            }

            res.status( 200 ).send( returnObj );
        } );
    };

    /*this.sendAnswer = function( req, res, next ) {
        var userId = req.session.uId;
        var body = req.body;
        var questionId = body._questionId;

        body._userId = userId;

        Answer
            .findOne( {_userId: ObjectId( userId ), _questionId: ObjectId( questionId ) })
            .exec( function ( err, answerModel ) {
                if ( err ) {
                    return next( err );
                }
                if ( answerModel ) {
                    answerModel.set( body );
                } else {
                    answerModel = new Answer( body );
                }

                answerModel
                    .save( function( err ){
                        if (err) {
                            console.log(err);
                            return res.status(500).send( { error: err.message } );
                        }

                        res.status(200).send( { success: "answer saved"} );
                    });

            } );

    };*/

    this.sendAnswer = function( req, res, next ) {
        var body = req.body;

        var answer = body.answer;
        var userId = req.session.uId;
        var questionId = req.params.id;
        var answerObj;
        var queueNumber;

        Questions.findOne({_id: questionId}, function(err, result){
            if (err){
                return next(err);
            }

            if (!result){
                err = new Error('Question not found');
                err.status = 400;
                return next(err);
            }

            queueNumber = result.queueNumber;


            User.findOne({_id: userId}, function(err, resultUser){

                if (err){
                    return next(err);
                }

                if (!resultUser){
                    err = new Error('User not found');
                    err.status = 400;
                    return next(err);
                }

                switch (queueNumber){
                    case 0: {
                        resultUser.usersSetting.gender = answer;
                    }
                        break;

                    case 1: {
                        resultUser.usersSetting.name = answer;

                    }
                        break;

                    case 2: {
                        //answer += ' 00:00 GMT+0';
                        resultUser.usersSetting.birthDate = new Date(answer);
                        answer =  resultUser.usersSetting.birthDate.toString();
                    }
                        break;

                    case 3: {
                        resultUser.usersSetting.height = answer;
                    }
                        break;

                    case 4: {
                        resultUser.usersSetting.weight = answer;
                    }
                        break;
                }

                resultUser.save(function(err){
                    if (err){
                        return next(err);
                    }

                    answerObj = {
                        _userId: userId,
                        _questionId: questionId,
                        answer: answer
                    };

                    Answer.findOne({_userId: userId, _questionId: questionId}, function(err, resultAnswer){

                        if (err){
                            return next(err);
                        }

                        if (!resultAnswer){
                            resultAnswer = new Answer(answerObj);
                        } else {
                            resultAnswer.answer = answer;
                        }

                        resultAnswer.save(function(err){
                            if (err){
                                return next(err);
                            }

                            res.status(200).send({success: 'settings saved successfully'});
                        });
                    });

                });

            });
        });


    };

    /* TODO REMOVE*/
    /*TEST BLOCK*/
    this.testAddQuestion = function( req, res, next ) {

        var body = req.body;
        var question = new Questions( body );

        question
            .save( function( err ){
                if (err) {
                    return res.status(500).send( err.message );
                }

                res.status(200).send( question );
            })
    };

    this.testGetQuestions = function ( req, res, next) {
        Questions
            .find({})
            .exec( function ( err, newQuestion ) {
                if (err) {
                    return res.status(500).send(err.message);
                }

                res.status(200).send( newQuestion );
            })
    };

    this.testDelQuestion = function ( req, res, next ) {
        var questionId = req.params.id;

        Questions.findByIdAndRemove( questionId)
            .exec( function ( err, removed ) {
                if ( err ) {
                    return res.status(500).send(err.message);
                }
                res.status(200).send( removed );
            })
    };


    this.testGetAnswers = function ( req, res, next) {
        Answer
            .find({})
            .exec( function ( err, answers ) {
                if (err) {
                    return res.status(500).send(err.message);
                }

                res.status(200).send( answers );
            });
    };

    this.testDelAnswer = function ( req, res, next ) {
        var answerId = req.params.id;

        Answer
            .findByIdAndRemove( answerId )
            .exec( function ( err, removed ) {
                if ( err ) {
                    return res.status(500).send(err.message);
                }
                res.status(200).send( removed );
            });
    }


};

module.exports = Questions;