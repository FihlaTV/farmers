/**
 * Created by User on 27.04.2015.
 */

var SessionHandler = require('./sessions');
var User = function(db) {

    var mongoose = require('mongoose');
    var session = new SessionHandler(db);
    var logWriter = require('../modules/logWriter')();
    var dateControl = require('../helpers/date')();
    var testUser = require('../helpers/test/user')();
    var lodash = require('lodash');
    var async = require('async');
    var User = db.model('user');
    var Plan = db.model('plan');
    var Lessons = db.model('lesson');
    var History = db.model('msgHistory');
    var Taxonomy = db.model('taxonomy');
    var ObjectId = mongoose.Types.ObjectId;
    var numberPattern  = /[^0-9]/;

    function makeHours(timeString, timeZone, formatSign){
        var hours;
        var minutes;
        var index;
        var time;
        var hoursUTC;

        if (!formatSign){
            formatSign = ':'
        }

        if (!timeZone){
            timeZone = 0;
        }

        index = timeString.indexOf(formatSign);
        hours = +(timeString.substr(0, index));



        if (numberPattern.test(hours) ||  +hours > 23 ||  +hours < 0){
            return false;
        }

        hours = (hours > 23) ? (23) : (hours < 0) ? (0) : hours;

        minutes = +(timeString.substr(index + 1));

        if (numberPattern.test(minutes) || parseInt(minutes) > 59 ||  parseInt(minutes) < 0){
            return false;
        }

        minutes = (minutes > 59) ? (59) : (minutes < 0) ? (0) : minutes;

        hoursUTC  = (hours - timeZone >= 0) ? (hours - timeZone) : (24 + (hours - timeZone));

        time = {
            hours: hoursUTC,
            minutes: minutes
        };

        return time;
    };

    function validateTime(timeString){
        var time = makeHours(timeString);

        if (!time){
            return false;
        }

        if (time.hours < 10){
            time.hours = '0' + time.hours;
        }

        if (time.minutes < 10){
            time.minutes = '0' + time.minutes;
        }
        return time.hours + ':' + time.minutes;
    }

    function checkParameters(object){
        return ( !object.sleepTime && !object.sleepTime.end && !object.sleepTime.start && !object.countMessage && !object.countMessage.affirmation && !object.countMessage.visualisation && !object.countMessage.lesson);
    }

    function getAllAffirmations(userId, timeToSend, callback){
        var affArray = [];
        var resultArray = [];

        User.findOne({_id: userId}, function(err, resultUser){
            if (err){
                return callback(err);
            }

            if (!resultUser){
                err = new Error('User not found');
                err.status = 400;
                return callback(err);
            }


            affArray = lodash.clone(resultUser.affirmations.toObject());

            async.each(affArray, function(aff, cb){


                if (aff.timeToSend === timeToSend){
                    resultArray.push(aff)
                }

                cb(null);

            }, function(err){
                if (err){
                    return callback(err);
                }
                callback(null, resultArray);
            });

        });
    };

    function getAllVisualisations(userId, timeToSend, callback){
        var visArray = [];
        var resultArray = [];

        User.findOne({_id: userId}, function(err, resultUser){
            if (err){
                return callback(err);
            }

            if (!resultUser){
                err = new Error('User not found');
                err.status = 400;
                return callback(err);
            }


            visArray = lodash.clone(resultUser.visualisations.toObject());

            async.each(visArray, function(vis, cb){


                if (vis.timeToSend === timeToSend){
                    resultArray.push(vis);
                }

                cb(null);

            }, function(err){
                if (err){
                    return callback(err);
                }
                callback(null, resultArray);
            });


        });
    }


    this.blockLesson = function(req, res, next){
        var userId = req.session.uId;
        var body = req.body;

        var updateObj = {
            $addToSet: {'blockedMessages': ObjectId(body.blockMsg)}
        };

        User.findOneAndUpdate({_id: userId}, updateObj, function(err, resultUser){
            if (err){
                return next(err);
            }

            if (!resultUser){
                err = new Error('User not found');
                err.status = 400;
                return next(err);
            }

            History.remove({msgId: ObjectId(body.blockMsg)}, function(err){
                if (err){
                   return logWriter.log(err);
                }

               // return logWriter.log('Lesson ' + body.blockMsg + 'deleted from history');
            });

            res.status(200).send({success: body.blockMsg + ' blocked successfully'});
        });
    };

    /*function getRandomLesson(blockedMsg, callback){
        var lessonRandomIndex;

        var blockedMessage = lodash.map(blockedMsg, function(m){
            return ObjectId(m);
        });

        Lessons.count({
            _id: {$nin: blockedMessage}
        }, function(err, count){
            lessonRandomIndex = lodash.random(0, count - 1);

            Lessons.aggregate([
                {$match:
                    {
                        _id: {$nin: blockedMessage}
                    }
                },
                {
                    $skip: lessonRandomIndex
                },
                {
                    $limit: 1
                }
            ]).exec(function(err, foundedLesson){
                if (err){
                    return callback(err);
                }

                if (!foundedLesson.length){
                    err = new Error('No lessons available');
                    err.status = 400;
                    return callback(err);
                }
                callback(null, foundedLesson[0]);
            });
        });
    }*/


    function getRandomDocument( condition, Model, callback  ) {
        Model.find( condition).count( function( err, count ) {
            var skip;

            if ( err ) {
                return callback( err );
            }

            switch ( count ) {
                case 0: {
                    callback( null, null );
                }
                    break;

                case 1: {
                    Model.findOne( condition, callback );
                }
                    break;

                default: {
                    skip = Math.floor( Math.random() * ( count ));

                    Model.find( condition )
                        .skip( skip )
                        .limit( 1 )
                        .exec( function( err, results ) {
                            if ( err ) {
                                return callback( err );
                            }

                            if ( ! results.length ) {
                                return callback( null, null );
                            }

                            callback( null, results[0] )
                        } )
                }
                    break;
            }

        })
    }

    function getValueFirstLVL (callback){
        var taxValueFirstLVL;

        Taxonomy.find({lvl: 1}, function(err, result){
            if (err){
                return callback(err);
            }

            if (!result.length){
                err = new Error('Taxonony lvl-1 not found');
                err.status = 400;
                return callback(err);
            }

            taxValueFirstLVL = lodash.pluck(result, '_id');

            callback(null, taxValueFirstLVL);
        });
    }

    function getNewLesson ( userId , callback) {

        function getUser ( userId, callback ) {
            User.findOne( { _id: userId })
                .exec( function ( err, user ) {
                    if ( err ) {
                        return callback( err );
                    }

                    if (!user) {
                        err = new Error('user with device: ' + userId + ' not found');
                        err.status = 400;
                        return callback( err );
                    }

                    callback( null, user );
                })
        }

        function getLessonForUser( user, callback ) {
            var query = {
                taxonomyValues: { $nin: user.sended },
                _id: { $nin: user.blockedMessages }
            };

            getRandomDocument( query, Lessons, function( err, randLesson ) {
                if ( err ) {
                    return callback( err );
                }

                if ( ! randLesson ) {

                    getRandomDocument( {_id: { $nin: user.blockedMessages }}, Lessons, function( err, result ) {
                        if ( err ) {
                            return callback( err );
                        }

                        if ( ! result ) {
                            err = new Error('No Lessons Found');
                            err.status = 404;

                            return callback( err );
                        }

                        user.set('sended', []);

                        user.save(function(err){
                            if (err){
                                return callback(err);
                            }

                            return callback( null, user._id, result );
                        });
                    });

                } else {
                    callback( null, user._id, randLesson );
                }

            })
        }

        function pushToSended (user, randomLesson, callback){
            var lessonValues = randomLesson.taxonomyValues;
            var resultValues;
            var lessonValToString;
            var resultToString;
            var resultValuesToObj;

            getValueFirstLVL(function(err, result){
                if (err){
                    return callback(err);
                }

                if (!result){
                    err = new Error('values not found');
                    err.status = 400;
                    return callback(err);
                }

                resultToString = lodash.map(result, function(r){
                    return r.toString();
                });

                lessonValToString = lodash.map(lessonValues, function(l){
                    return l.toString();
                });

                resultValues = lodash.intersection(resultToString, lessonValToString);

                resultValuesToObj = lodash.map(resultValues, function(r){
                    return ObjectId(r);
                });

                User.findOneAndUpdate({_id: user}, {$addToSet: {sended: {$each: resultValuesToObj}}}, function(err){
                    if (err){
                        return callback(err);
                    }

                    callback(null, randomLesson);
                });

            });


        }


        async.waterfall([
            async.apply(getUser, userId),
            getLessonForUser,
            pushToSended
        ], function(err, resultLesson) {
            if (err){
                return callback(err);
            }

            callback(null, resultLesson);
        });
    }

    function validateUser(user){
        return ( user && user.usersSetting && user.usersSetting.sleepTime && user.usersSetting.sleepTimeWeekEnd );
    }

    function createPlan(userId, isWeekEnd, callback){
        var startDay;
        var endDay;
        var countMessage;
        var timeInterval;
        var oneHour = 60;
        var difference;
        var plan = [];
        var morningTime;
        var eveningTime;
        var time;
        var random;
        var i;
        var begin;
        var end;
        var timeToSend;
        var timeObj;

        User.findOne({_id: userId}, function(err, foundedUser){
            if (err){
                return callback(err);
            }

            if (!validateUser(foundedUser)){
                err = new Error('Not enough parameters');
                err.status = 400;
                return callback(err);
            }

            if (!isWeekEnd){
                startDay = makeHours(foundedUser.usersSetting.sleepTime.end, foundedUser.timeZone);
                endDay = makeHours(foundedUser.usersSetting.sleepTime.start, foundedUser.timeZone);

                begin = startDay.hours * 60 + startDay.minutes;
                end = endDay.hours * 60 + endDay.minutes;

            } else {
                startDay = makeHours(foundedUser.usersSetting.sleepTimeWeekEnd.end, foundedUser.timeZone);
                endDay = makeHours(foundedUser.usersSetting.sleepTimeWeekEnd.start, foundedUser.timeZone);
            }

            countMessage = foundedUser.affirmations.length + foundedUser.visualisations.length + 50; //todo change

            morningTime = begin + 2 * 60;
            eveningTime = end - 2 * 60;

            timeInterval = Math.abs(end - begin) / (countMessage - 1);

            if (timeInterval > oneHour){
                difference = timeInterval - oneHour;
            } else {
                difference = 0;
            }

            for (i = 0; i < countMessage; i++){

                if (i === 0) {
                    random = lodash.random(0, (difference / 2));
                } else if (i === countMessage - 1){
                    random = lodash.random(-(difference / 2), 0);
                } else {
                    random = lodash.random(-(difference / 2), (difference / 2));
                }

                time = begin + i * timeInterval + random;

                if (time % 60 === 0){
                    time += 1;
                }

                if (time <= morningTime) {
                    timeToSend = 'morning';
                } else if (time >= eveningTime){
                    timeToSend = 'evening';
                } else {
                    timeToSend = 'any';
                }

                timeObj = {
                    time: Math.floor(time) % 1440,
                    timeToSend: timeToSend
                };

                plan.push(timeObj);
            }

            callback(null, plan);

        });
    }

    function getAndFillAff(userId, timeToSend, planArray, isWeekEnd, lastPlanTime, callback) {
        var insertObj;
        var msgTime;
        var index;
        var plan;
        var lastMessage;
        var timeArray;
        var randomIndex;

        getAllAffirmations(userId, timeToSend, function (err, resultAff) {
            if (err) {
                return callback(err);
            }

            if (!resultAff.length){

                return callback(null);
            }

            async.each(resultAff, function (aff, cb) {

                timeArray = lodash.groupBy(planArray, {timeToSend: timeToSend})['true'];
                randomIndex  = lodash.random(0, timeArray.length - 1);
                msgTime = timeArray[randomIndex]['time'];
                index = lodash.findIndex(planArray, {time: msgTime});

                planArray.splice(index, 1);

                if (msgTime === lastPlanTime){
                    lastMessage = true;
                } else {
                    lastMessage = false;
                }

                insertObj = {
                    refUser: userId.toString(),
                    messageType: 'affirmation',
                    messageId: aff._id,
                    messageTime: msgTime,
                    time: timeToSend,
                    lastMessage: lastMessage,
                    isWeekEnd: isWeekEnd
                };

                plan = new Plan(insertObj);

                plan.save(function (err) {
                    if (err) {
                        return cb(err);
                    }
                    cb(null);
                });
            }, function (err) {
                if (err) {
                   return callback(err);
                }
                callback(null);
            });
        });
    }

    function getAndFillVis(userId, timeToSend, planArray, isWeekEnd, lastPlanTime, callback){
        var insertObj;
        var msgTime;
        var index;
        var plan;
        var lastMessage;
        var timeArray;
        var randomIndex;

        getAllVisualisations(userId, timeToSend, function(err, resultVis){
            if (err){
                return callback(err);
            }

            if (!resultVis.length){

                return callback(null);
            }

            async.each(resultVis, function(vis, cb){

                timeArray = lodash.groupBy(planArray, {timeToSend: timeToSend})['true'];
                randomIndex  = lodash.random(0, timeArray.length - 1);
                msgTime = timeArray[randomIndex]['time'];
                index = lodash.findIndex(planArray, {time: msgTime});
                planArray.splice(index, 1);

                if (lastPlanTime === msgTime){
                    lastMessage = true;
                } else {
                    lastMessage = false;
                }

                insertObj = {
                    refUser: userId.toString(),
                    messageType: 'visualisation',
                    messageId: vis._id,
                    messageTime: msgTime,
                    time: timeToSend,
                    lastMessage: lastMessage,
                    isWeekEnd: isWeekEnd
                };

                plan = new Plan(insertObj);

                plan.save(function(err){
                   if (err){
                       return cb(err);
                   }

                   cb(null);
                });

            }, function(err){
                    if (err){
                        callback(err);
                    }
                    callback(err);
            });
        });
    }

    function getAndFillLessons(userId, planArray, lastPlanTime, callback){
        var planModel;
        var insertObj;
        var blockedLessons;
        var blockedTaxonomies;
        var lastMessage;

        User.findOne({_id: userId}, function(err, resultUser){
            if (err){
                return callback(err);
            }

            if (!resultUser){
                err = new Error('User not found');
                err.status = 400;
                return callback(err);
            }

            blockedLessons = resultUser.blockedMessages;
            blockedTaxonomies = resultUser.blockedThemes;

            async.eachSeries(planArray, function(plan, cb){
                getNewLesson(userId, function(err, lesson){
                    if (err){
                        return cb(err);
                    }

                    if (plan.time === lastPlanTime){
                        lastMessage = true;
                    } else {
                        lastMessage = false;
                    }

                    insertObj = {
                        refUser: userId,
                        messageType: 'lesson',
                        messageId: lesson._id,
                        messageTime: plan.time,
                        time: 'any',
                        lastMessage: lastMessage
                    };

                    planModel = new Plan(insertObj);

                    planModel.save(function(err){
                        if(err){
                            return cb(err);
                        }

                        cb(null);
                    });
                });
            }, function(err){
                if (err){
                    return callback(err);
                }
                callback(null);
            });

        });
    }

    function deletePreviousPlan(userId, callback){
        Plan.remove({refUser: userId}, function(err){
            if (err){
                return callback(err);
            }

            callback(null);
        });
    }

    function createMsgPlan(userId, isWeekEnd, callback){

        var lastPlanTime;

        createPlan(userId, isWeekEnd, function(err, planArray){

            if (err){
                return callback(err);
            }

            if (!planArray.length){
                err = new Error('Plan not created');
                err.status = 400;
                return callback(err);
            }


            lastPlanTime = lodash.max(lodash.pluck(planArray, 'time'));

            async.series([

                async.apply(deletePreviousPlan, userId),
                async.apply(getAndFillAff, userId, 'morning', planArray, isWeekEnd, lastPlanTime),
                async.apply(getAndFillAff, userId, 'any', planArray, isWeekEnd, lastPlanTime),
                async.apply(getAndFillAff, userId, 'evening', planArray, isWeekEnd, lastPlanTime),
                async.apply(getAndFillVis, userId, 'morning', planArray, isWeekEnd, lastPlanTime),
                async.apply(getAndFillVis, userId, 'any', planArray, isWeekEnd, lastPlanTime),
                async.apply(getAndFillVis, userId, 'evening', planArray, isWeekEnd, lastPlanTime),
                async.apply(getAndFillLessons, userId, planArray, lastPlanTime)

            ], function(err){
                if (err){
                    return callback(err);
                }
                callback(null);
            });
        });
    }

    function userSettingsValidate(user){
        if (!user.usersSetting.birthDate && !user.usersSetting.gender && user.usersSetting.sleepTime === {} && user.usersSetting.sleepTimeWeekEnd === {} && !user.usersSetting.hight && !!user.usersSetting.weight){
            return false;
        } else {
            return true;
        }
    }

    this.getUserSettings = function(req, res, next){
        var userId = req.session.uId;
        var settingsObj;

        User.findOne({_id: userId}, function(err, resultUser){
            if (err) {
                return next(err);
            }

            if (!resultUser){
                err = new Error('User not found');
                err.status = 400;
                return next(err);
            }

            if (!userSettingsValidate(resultUser)){
                res.status(200).send({});
            } else {
                settingsObj = resultUser.usersSetting.toJSON();

                res.status(200).send(settingsObj);
            }
        });
    };

    this.addUserSettings = function(req, res, next){
        var userId = req.session.uId;
        var body = req.body;
        var sleepTime;
        var sleepTimeWeekEnd;
        var birthDate;
        var gender;
        var height;
        var weight;
        var settings;
        var isWeekEnd;

        User.findOne({_id: userId}, function(err, resultUser){
            if (err){
                return next(err);
            }

            if (!resultUser){
                err = new Error('User not found');
                err.status = 400;
                return next(err);
            }

            settings = resultUser.usersSetting;

            if (body.sleepTime) {

                if (!validateTime(body.sleepTime.start) || !validateTime(body.sleepTime.end)){
                    err = new Error('time validation failure');
                    err.status = 400;
                    return next(err);
                } else {
                    sleepTime = {
                        start: validateTime(body.sleepTime.start),
                        end: validateTime(body.sleepTime.end)
                    };
                }

                settings.sleepTime = sleepTime;
            }

            if (body.sleepTimeWeekEnd) {
                if (!validateTime(body.sleepTimeWeekEnd.start) || !validateTime(body.sleepTimeWeekEnd.end)){
                    err = new Error('time validation failure');
                    err.status = 400;
                    return next(err);
                } else {
                    sleepTimeWeekEnd = {
                        start: validateTime(body.sleepTimeWeekEnd.start),
                        end: validateTime(body.sleepTimeWeekEnd.end)
                    };
                }

                settings.sleepTimeWeekEnd = sleepTimeWeekEnd;
            }

            if (body.birthDate) {

                birthDate = new Date(body.birthDate);

                settings.birthDate = birthDate;
            }

            if (body.gender) {
                gender = body.gender;

                settings.gender = gender;
            }

            if (body.height) {
                height = body.height;

                settings.height = height;
            }

            if (body.weight) {
                weight = body.weight;

                settings.weight = weight;
            }

            if (body.name){
                settings.name = body.name;
            }

            resultUser.usersSetting.set(settings);

            resultUser.save(function(err){
                if (err){
                    return next(err);
                }

                isWeekEnd = dateControl.isWeekEnd(resultUser.timeZone);

                if ((body.sleepTime && !isWeekEnd) || (body.sleepTimeWeekEnd && isWeekEnd)){

                    createMsgPlan(userId, isWeekEnd, function(err){
                       if (err){
                           return next(err);
                       }

                       res.status(200).send({success: 'Setting added successfully'});
                    });
                } else {
                    res.status(200).send({success: 'Setting added successfully'});
                }
            });
        });
    };



    this.getUser = function(req, res, next){

        var userId = req.session.uId;

        var projObj = {
            '_id': 0,
            '__v': 0
        };

        var findObj = {
            _id: userId
        };

        User.findOne(findObj, projObj, function(err, resultObject){
            if (err){
                return next(err);
            }

            if (!resultObject){
                err = new Error('User not found');
                err.status = 400;
                return next(err);
            }

            res.status(200).json(resultObject);
        });
    };


    function validateTimeToSend(timeToSend){
        var time = timeToSend.toLowerCase();
        var regExp = /^morning$|^evening$|^any$/i;

        if (!regExp.test(time)){
            return false;
        } else {
            return time;
        }
    }

    this.getAffirmation = function(req, res, next){
        var userId = req.session.uId;
        var affirmationId = req.params.id;
        var user;
        var index;
        var foundedObj;
        var resultObj;

        User.findOne({_id: userId}, function(err, resultUser){
            if (err){
                return next(err);
            }

            if (!resultUser){
                err = new Error('User not found');
                err.status = 400;
                return next(err);
            }

            user = resultUser.toJSON();

            if (!user.affirmations.length){
                res.status(400).send({});
            } else {

                index = lodash.findIndex(user.affirmations, {id: affirmationId});
                foundedObj = user.affirmations[index];

                if (!foundedObj){
                    res.status(400).send({});
                } else {
                    resultObj = {
                        id: foundedObj.id,
                        text: foundedObj.text,
                        timeToSend: foundedObj.timeToSend
                    };

                    res.status(200).send(resultObj);
                }
            }
        });
    };


    this.addAffirmation = function(req, res, next){
        var userId = req.session.uId;
        var affirmationId = req.params.id;
        var insert = req.body;
        var user;
        var insertObj;
        var updateUser;
        var timeToSend;
        var isWeekEnd;

        User.findOne({_id: userId}, function(err, foundedUser){
            if (err){
                return next(err);
            }

            if (!foundedUser){
                err = new Error('User not found');
                err.status = 400;
                return next(err);
            }

            user = foundedUser.toJSON();

            if (affirmationId < user.countAffirmations){
                User.findOne({_id: userId, 'affirmations.id': affirmationId}, function(err, result){
                    if (err){
                        return next(err);
                    }
                    if (!result){

                        if(!insert.text || !insert.timeToSend){
                            err = new Error('You must fill all parameters for the first adding affirmation');
                            err.status = 400;
                            return next(err);
                        }

                        timeToSend = validateTimeToSend(insert.timeToSend);

                        if (!timeToSend){
                            err = new Error('validation failure');
                            err.status = 400;
                            return next(err);
                        }

                        insertObj = {
                            id: affirmationId,
                            text: insert.text,
                            timeToSend: timeToSend
                        };

                        updateUser = {
                            $addToSet: {affirmations: insertObj}
                        };
                        User.update({_id: userId}, updateUser, function(err){
                            if (err){
                                return next(err);
                            }

                            isWeekEnd = dateControl.isWeekEnd(user.timeZone);

                            createMsgPlan(userId, isWeekEnd, function(err){

                                if (err){
                                    return next(err);
                                }
                                res.status(200).send({success: 'affirmation added successfully'});
                            });
                        });
                    } else {
                        insertObj = lodash.findWhere(result.affirmations.toObject(), {id: affirmationId});

                        if (insert.text){
                            insertObj.text = insert.text;
                        }


                        if (insert.timeToSend && validateTimeToSend(insert.timeToSend)){

                            insertObj.timeToSend = validateTimeToSend(insert.timeToSend);
                        } else {
                            err = new Error('validation failure');
                            err.status = 400;
                            return next(err);
                        }

                        User.update({_id: userId, 'affirmations.id': affirmationId}, {$set:{'affirmations.$': insertObj}}, function(err){
                            if(err){
                                return next(err);
                            }
                            res.status(200).send({success: 'affirmation added successfully'});
                        });
                    }
                });
            } else {
                err = new Error('Can\'t add more affirmations');
                err.status = 400;
                return next(err);
            }
        });
    };

    this.deleteAffirmation = function(req, res, next){
        var userId = req.session.uId;
        var affirmationId = req.params.id;
        var optionObj;
        var isWeekEnd;
        var findObj = {
            _id: userId
        };

        User.findOne(findObj, function(err, resultUser){
            if (err){
                return next(err);
            }

            if (!resultUser){
                err = new Error('User not found');
                err.status = 400;
                return next(err);
            }

            optionObj = {
                $pull: {
                    affirmations: {id: affirmationId}
                }
            };

            User.update(findObj, optionObj, function(err){
                if (err){
                    return next(err);
                }

                isWeekEnd = dateControl.isWeekEnd(resultUser.timeZone);

                createMsgPlan(userId, isWeekEnd, function(err){

                    if(err){
                        return next(err);
                    }
                    res.status(200).send({success: 'affirmation deleted successfully'});
                });
            });
        });
    };

    this.getVisualisation = function(req, res, next){
        var userId = req.session.uId;
        var visualisationId = req.params.id;
        var user;
        var returnObj;
        var index;
        var foundedObj;

        User.findOne({_id: userId}, function(err, resultUser){
            if (err){
                return next(err);
            }

            if (!resultUser){
                err = new Error('User not found');
                err.status = 400;
                return next(err);
            }

            user = resultUser.toJSON();

            if (!user.visualisations.length){
                res.status(200).send({});
            } else {

                index = lodash.findIndex(user.visualisations, {id: visualisationId});
                foundedObj = user.visualisations[index];
                if (!foundedObj){
                    res.status(400).send({});
                } else {

                    returnObj = {
                        id: foundedObj.id,
                        timeToSend: foundedObj.timeToSend,
                        text: foundedObj.text,
                        imageId: foundedObj.imageId
                    };

                    res.status(200).send(returnObj);
                }
            }
        });
    };

    this.addVisualisation = function(req, res, next){
        var userId = req.session.uId;
        var user;
        var visualisationId = req.params.id;
        var insert = req.body;
        var insertObj;
        var updateUser;
        var timeToSend;
        var isWeekEnd;

        User.findOne({_id: userId}, function(err, resultUser){
            if (err){
                return next(err);
            }

            if (!resultUser){
                err = new Error('User not found');
                err.status = 400;
                return next(err);
            }

            user = resultUser.toJSON();

            if (visualisationId < user.countVisualisations ){

                User.findOne({_id: userId, 'visualisations.id': visualisationId}, function(err, result){
                    if (!result){

                        if (!insert.text || !insert.timeToSend || !insert.imageId){
                            err = new Error('You must fill all parameters for the first adding visualisation');
                            err.status = 400;
                            return next(err);
                        }

                        timeToSend = validateTimeToSend(insert.timeToSend);

                        if (!timeToSend){
                            err = new Error('validation failure');
                            err.status = 400;
                            return next(err);
                        }

                        insertObj = {
                            id: visualisationId,
                            text: insert.text,
                            timeToSend: timeToSend,
                            imageId: insert.imageId
                        };

                        updateUser = {
                            $addToSet: {visualisations: insertObj}
                        };

                        User.update({_id: userId}, updateUser, function(err){
                            if (err){
                                return next(err);
                            }

                            isWeekEnd = dateControl.isWeekEnd(user.timeZone);

                            createMsgPlan(userId, isWeekEnd, function(err){

                                if (err){
                                    return next(err);
                                }
                                res.status(200).send({success: 'Visualisation added successfully'});
                            });
                        });
                    } else {

                        insertObj = lodash.findWhere(result.visualisations.toObject(), {id: visualisationId});

                        if (insert.text){
                            insertObj.text = insert.text;
                        }

                        if (insert.timeToSend && validateTimeToSend(insert.timeToSend)){
                            insertObj.timeToSend = validateTimeToSend(insert.timeToSend);
                        } else {
                            err = new Error('validation failure');
                            err.status = 400;
                            return next(err);
                        }

                        if (insert.imageId){
                            insertObj.imageId = insert.imageId;
                        }

                        User.update({_id: userId, 'visualisations.id': visualisationId}, {$set: {'visualisations.$': insertObj}}, function(err){
                            if (err){
                                return next(err);
                            }

                            res.status(200).send({success: 'Visualisation updated successfully'});
                        });
                    }
                });
            } else {
                err = new Error('Can\'t add more visualisations');
                err.status = 400;
                return next(err);
            }
        });
    };

    this.deleteVisualisation = function(req, res, next){
        var userId = req.session.uId;
        var visualisationId = req.params.id;
        var optionObj;
        var isWeekEnd;

        User.findOne({_id: userId}, function(err, resultUser){
           if (err){
               return next(err);
           }

           if (!resultUser){
               err = new Error('User not found');
               err.status = 400;
               return next(err);
           }

           optionObj = {
               $pull:{
                   visualisations: {id: visualisationId}
               }
           };

           User.update({_id: userId}, optionObj, function(err){
               if (err){
                   return next(err);
               }

               isWeekEnd = dateControl.isWeekEnd(resultUser.timeZone);

               createMsgPlan(userId, isWeekEnd, function(err){
                   if (err){
                       return next(err);
                   }

                   res.status(200).send({success: 'visualisation deleted successfully'});
               });

           });
        });
    };

    this.getHistory = function(req, res, next){

        var userId = req.session.uId;
        var resultHistory = [];
        var sendObj;
        var date = new Date();

        date.setDate(date.getDate() - 7);
        date.setHours(0);
        date.setMinutes(0);
        date.setSeconds(0);

        History.find({userId: userId, sendDate: {$gte: date}})
            .populate({
                'path': 'msgId',
                'select': 'text'
            })
            .exec(function (err, result) {

                if (err) {
                    return next(err);
                }

                if (!result) {
                    err = new Error('History not found');
                    err.status = 400;
                    return next(err);
                }

                async.each(result, function(history, cb){

                    if (!history || !history.msgId || !history.msgId.text || !history.sendDate){
                        err = new Error('Not valid parameters');
                        err.status = 400;
                        cb(err);

                    }

                    sendObj = {
                        text: history.msgId.text,
                        date: history.sendDate,
                        lessonId: history.msgId._id
                    };

                    resultHistory.push(sendObj);

                    cb(null);

                }, function(err){
                    if (err){
                        return next(err);
                    }
                    res.status(200).send(resultHistory);
                });


            });

    };

    function getUser(userId, callback){

        User.findOne({_id: userId}, function(err, user){
            if (err){
                return callback(err);
            }

            if (!user){
                err = new Error('User not found');
                err.status = 400;
                return callback(err);
            }

            callback(null, user);
        });
    }

    function findLessons(user, callback){

        var sendedValues = user.sended;
        var blockedMessages = user.blockedMessages;

        Lessons.find({taxonomyValues: {$nin: sendedValues}}, {_id: {$nin: blockedMessages}})
            .exec(function(err, resultLessons){
                if (err){
                    return callback(err);
                }

                callback(null, user, resultLessons);
            });
    }

    function pushValues(user, lessons, callback){

        var blockedMessages = user.blockedMessages;

        if (!lessons.length){
            Lessons.find({_id: {$nin: blockedMessages}})
                .exec(function(err, result){
                    if (err){
                        return callback(err);
                    }

                    if (!result.length){

                        err = new Error('Lesson not found');
                        err.status = 400;
                        return callback(err);

                    }

                    lessons = lodash.clone(result);
                });

        }
    }

    this.signInClient = function ( req, res, next ) {
        var body = req.body;
        var deviceId = body.deviceId;
        var timeZone = body.timeZone;
        var isWeekEnd;

        var options = {
            deviceId: deviceId,
            timeZone: timeZone
        };

        var err;

        if ( !body || !deviceId ) {
            err = new Error('Bad Request');
            err.status = 400;
            return next( err );
        }

        User
            .findOne( { deviceId: deviceId })
            .exec( function ( err, model ) {
                if (err) {
                    return next(err)
                }

                if (model) {
                    if (model.timeZone !== timeZone){
                        model.timeZone = timeZone;
                    }

                    model.save(function(err){
                        if (err){
                            return next(err);
                        }
                        return session.register(req, res, model._id.toString());
                    });

                } else {

                    model = new User(options);

                    model
                        .save(function (err) {
                            if (err) {
                                return next(err);
                            }
                            isWeekEnd = dateControl.isWeekEnd(timeZone);

                            createMsgPlan(model._id, isWeekEnd, function(err){
                                if (err){
                                    return next(err);
                                }

                                return session.register(req, res, model._id.toString());
                            });
                        });
                }

            });
    };

    this.signOut = function ( req, res, next ) {
        session.kill( req, res, next );
    };

    /*TODO remove*/
    /*TEST BLOCK*/




    this.makePLan = function(req, res, next){

        var userId = req.session.uId;
        var timeZone;
        var isWeekEnd;

        User.findOne({_id: userId}, function(err, resultUser){
            if (err){
                return next(err);
            }

            if (!resultUser){
                err = new Error('User not found');
                err.status = 400;
                return next(err);
            }

            timeZone = resultUser.timeZone;

            isWeekEnd = dateControl.isWeekEnd(timeZone);

            createMsgPlan(userId, isWeekEnd, function(err){
                if (err){
                    return next(err);
                }
                res.status(200).send({success: 'Plan created successfully'});
            });

        });
    };

    // todo remove (test method)

    this.getPlan = function(req, res, next){
        var userId = req.session.uId;
        var arr;

        Plan.find({refUser: userId.toString()},{_id: 0, __v: 0, refUser: 0}, function(err, result){
            if (err){
                return next(err);
            }

            if (!result.length){
                err = new Error('Plan not found');
                err.status = 400;
                return next(err);
            }

           arr = lodash.sortBy(result, 'messageTime');

            res.status(200).send(arr);
        });
    };


    this.testPlan = function(req, res, next){
        var userId = req.session.uId;

        createPlan(userId, false, function(err, result){
            if (err){
                return next(err);
            }
            res.status(200).send(result);
        });
    }

    this.createUserTest = function(req, res, next){

        var isWeekEnd;

        testUser.createUser(User, function(err, user){
            if (err){
                return next(err);
            }

            isWeekEnd = dateControl.isWeekEnd(user.timeZone);

            createMsgPlan(user._id, isWeekEnd, function(err){

                if (err){
                    return next(err);
                }
                session.register(req, res, user._id, false);
            });
        })
    }

    this.createPlanTest = function(req, res, next){

        var userId = req.params.id;
        testUser.createPlan(createMsgPlan, userId, function(err){
            if (err){
                return next(err);
            }

            res.status(200).send({success: 'test plan created!'})
        })
    }

    this.createHistoryTest = function(req, res, next){
        var userId = ObjectId(req.params.id);

        testUser.createHistory(Plan, History, userId, function(err){
            if (err){
                return next(err);
            }

            res.status(200).send({success: 'test history created'});
        });

    }
};

module.exports = User;