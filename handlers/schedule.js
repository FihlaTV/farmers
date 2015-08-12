/**
 * Created by User on 29.04.2015.
 */
var crontab = require('node-crontab');
var hourlyCronJobs = [];
var oneCronJob;
var logWriter = require('../modules/logWriter')();
var lodash = require('lodash');
var async = require('async');
var mongoose = require('mongoose');
var ObjectId = mongoose.Types.ObjectId;


module.exports = function ( db ) {
    var User = db.model('user');
    var Plan = db.model('plan');
    var Lesson = db.model('lesson');
    var History = db.model('msgHistory');
    var NotificationHandler = require('./pushes');
    var notification = new NotificationHandler(db);


    function isWeekEnd( date ) {

        return ( date.getUTCDay() === 6 || date.getUTCDay() === 0 );

    }

    function getMsg(job, callback){
        var err;
        var plan = job;
        var affirmations;
        var visualisations;
        var resultMessage;
        var msgObj;

        if (!plan || !plan.messageType || !plan.messageId){
            err = new Error('Not valid parameters');
            err.status = 400;
            return callback(err)
        } else {

            if (plan.messageType === 'lesson'){

                Lesson.findOne({_id: ObjectId(plan.messageId)},function(err, resultMsg){

                    if (err){
                        return callback(err);
                    }

                    if (!resultMsg){

                        err = new Error('Lesson not found');
                        err.status = 404;
                        return callback(err);

                    }

                    msgObj = {
                        msg: resultMsg,
                        type: 'L'
                    };

                    callback(null, msgObj);
                });

            } else if (plan.messageType === 'affirmation' || plan.messageType === 'visualisation'){

                User.findOne({_id: plan.refUser}, function(err, resultUser){

                    if (err){

                        return callback(err);

                    }

                    if (!resultUser){

                        err = new Error('User not found');
                        err.status = 404;
                        return callback(err);

                    }

                    if (plan.messageType === 'affirmation'){

                        affirmations = resultUser.affirmations.toObject();
                        resultMessage = lodash.findWhere(affirmations, {_id: ObjectId(plan.messageId)});

                        msgObj = {
                            msg: resultMessage,
                            type: 'A'
                        };

                        return callback(null, msgObj);


                    } else if (plan.messageType === 'visualisation'){

                        visualisations = resultUser.visualisations.toObject();
                        resultMessage = lodash.findWhere(visualisations, {_id: ObjectId(plan.messageId)});

                        msgObj = {
                            msg: resultMessage,
                            type: 'V'
                        };
                        return callback(null, msgObj);

                    }
                });
            }
        }
    }

    function saveMsgToHistory(message, refUser, callback){
        var msgObj = message.msg;
        var msgType = message.type;
        var insertObj;
        var historyModel;
        var err;

        if ( !message ){

            err = new Error('Not valid parameters');
            err.status = 404;
            return callback(err);

        }

        if (msgType === 'L'){
            insertObj = {
                userId: ObjectId(refUser),
                msgId: ObjectId(msgObj._id),
                msgType: msgType
            };

            historyModel = new History(insertObj);

            historyModel.save(function(err){
                if (err){
                    return callback(err);
                }

                return callback(null);
            });
        } else {
            callback(null);
        }

    }

    function createSendJob(now, job, callback ){
        var jobMinutes = job.messageTime % 60;
        var refUser = job.refUser;
        var cronDate = new Date( now );
        var cronString = [
            jobMinutes,
            now.getHours(),
            now.getDate(),
            now.getMonth() + 1,
            '*'
        ].join(' ');

        cronDate.setMinutes( jobMinutes );

        if ( new Date() > cronDate ) {
            return callback()
        }

        oneCronJob = crontab.scheduleJob(cronString, function() {

            getMsg( job, function( err, message) {
                if ( err ) {
                    return logWriter.log( err );
                }

                if ( !message ) {
                    err = new Error('Message not found');
                    err.status = 404;
                    return logWriter.log( err );
                }

                saveMsgToHistory( message, job.refUser, function( err ) {
                    if ( err ) {
                        return logWriter.log( err );
                    }

                    /*TODO change to log write or delete*/
                    var curDate = new Date();
                    console.log('---------Executed Schedule-----------\n' +
                        ' User: ' + refUser + '\n' +
                        ' Time: '+ new Date() + ' | ' + (curDate.getUTCHours() * 60) % 1440 + '\n' +
                        ' Is Weekend: ' + job.isWeekEnd + '\n' +
                        '----------------------------------\n'
                    );

                    notification.sendPush( job.refUser, message.msg, function ( err ) {
                        if ( err ) {
                            return console.log( err.message )
                        }

                        console.log('User: ' + job.refUser + ' - message pushed');
                    } )

                } )
            })

        }, null, null, false );

        saveJobId( oneCronJob );

        /*TODO change to log write or delete*/
        console.log('---------Added Schedule-----------\n' +
                    ' Cron for User: ' + refUser + '\n' +
                    ' Time to Send: '+ Math.floor( jobMinutes / 60 ) + ':' + jobMinutes % 60 + '\n' +
                    ' Is Weekend: ' + job.isWeekEnd + '\n' +
                    '----------------------------------\n'
        );
        callback();
    }


    function getUserMsgsForHour( now, user, callback ) {
        var deltaTime = user.timeZone * 1000 * 60 * 60;
        var userDate = new Date( now.getTime() + deltaTime );
        var findCondition = {
            isWeekEnd: isWeekEnd( userDate ),
            refUser: user._id.toString(),
            messageTime: {
                $gte:  now.getUTCHours() * 60,
                $lt:  now.getUTCHours() * 60 + 59
            }
        };


        Plan.find( findCondition ).exec( function ( err, jobs ) {
            if (err) {
                return callback( err );
            }

            console.log('Find plan for user: ' + jobs.length );
            console.log('Find condition: ' + JSON.stringify( findCondition ) );

            /*TODO  set limit*/
            async.eachLimit( jobs, 3, async.apply( createSendJob, now ) , function( err ){
                if ( err ) {
                    return callback( err );
                }
                callback();
            });
        })
    }

    function cancelUserJobs() {
        /* TODO optimize*/
        hourlyCronJobs.forEach( function( cronJobId ) {
            crontab.cancelJob( cronJobId );
        });

        hourlyCronJobs = [];
    }

    function saveJobId ( cronJobId ) {
        hourlyCronJobs.push( cronJobId );
    }

    function sheduleJobsForUsers ( callback ) {
        var now = new Date();

        cancelUserJobs();

        /*TODO REMOVE */
        console.log('---------START HOURLY-----------\n' +
                    ' Time: '+ new Date() + ' | ' + (now.getUTCHours() * 60) % 1440 + '\n' +
                    '----------------------------------\n'
        );

        User.find({})
            .exec( function( err, users ) {
                if ( err ) {
                    return callback( err );
                }

                now.setMinutes(1);
                now.setSeconds(1);

                console.log('users found: '+ users.length );
                console.log('Now: ' + now) ;

                /*TODO set limit*/
                async.eachLimit( users, 2, async.apply( getUserMsgsForHour, now ), function(err) {
                    if ( err ) {
                        return callback( err );
                    }

                });
                callback();
            })

    }

    this.startMainCron = function () {

        sheduleJobsForUsers( function(err){
            if ( err ) {
                console.log('Error Start schedule'); // todo custom err
            }
        });

        crontab.scheduleJob('0 * * * *', function() {

            sheduleJobsForUsers( function(err){
                if ( err ) {
                    console.log('Error Start schedule'); // todo custom err
                }
            })
        }, null, null, true );

        console.log('Main scheduler started');

    };



    this.getJobs = function ( req, res, next ) {
        res.status( 200).send( { success: 'Jobs for hour Id [' + hourlyCronJobs.join() + ']' });
    };

    this.deleteJob = function ( ) {
        cancelUserJobs();
    };

    this.startHourlyJob = function ( req, res, next ) {
        sheduleJobsForUsers( function(err){
            if ( err ) {
                res.status(500).send({error: err.message});
            }

            res.status( 200).send({ succes: 'Hourly Jobs Created'});
        })
    };

    //todo remove TEST

    this.getMsg = function(req, res, next){
        var userId = req.session.uId;

        var job = req.body;

        getMsg(job, function(err, resultMSG){
            if (err){
                return next(err);
            }

            saveMsgToHistory(resultMSG, userId, function(err){
                if (err){
                    return next(err);
                }

                res.status(200).send({success: 'msg save to history successfully'});
            })
        });

    }


};
