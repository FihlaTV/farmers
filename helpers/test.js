/**
 * Created by eriy on 29.04.2015.
 */
var crontab = require('node-crontab');
var jobArray = [];
var locJobArray = [];
var mainCounter = 0;
var counter = 0;
var async = require('async');


module.exports = function ( db ) {
    var User = db.model('user');
    var Plan = db.model('plan');

    function isWeekEnd( date ) {
        var result = false;

        if ( date.getUTCDay() === 6 || date.getUTCDay() === 0 ) {
            result = true;
        }

        return result;
    }


    function sendMsg( userId ) {
        console.log('Msg for ' + userId );
    }

    function createSendJob( job, callback ){
        var jobMinutes = job.messageTime % 60;
        var refUser = job.refUser;
        //var cronString = jobMinutes.toString() + ' * * * *';
        var cronString = '* * * * * *';

        crontab.scheduleJob(cronString, function() {
            sendMsg( refUser );
        }, null, null, false );
        callback();
    };


    function getUserJobsForHour( now, user, callback ) {
        var deltaTime = user.timeZone * 1000 * 60 * 60;
        var userDate = new Date( now - deltaTime );
        var findCondition = {
            isWeekEnd: isWeekEnd( userDate ),
            refUser: user.userId,
            messageTime: {
                $gt:  now.getUTCHours() * 60,
                $lt:  now.getUTCHours() * 60 + 59
            }
        };


        Plan.find( findCondition ).exec( function ( err, jobs ) {
                if (err) {
                    return callback( err );
                }
                async.eachLimit( jobs, 3, createSendJob, function( err ){
                    if ( err ) {
                        return callback( err );
                    }
                    callback();
                }); //todo set limit
            })
    }

    function addJobsForUsers (  ) {
        var now = new Date();
        User.find({})
            .exec( function( err, users ) {
                if ( err ) {
                    //return callback( err );
                }

                now.setMinutes(1);
                now.setSeconds(1);

                async.eachLimit( users, 2, async.apply( getUserJobsForHour, now ), function(err) {
                    if ( err ) {
                        //return callback( err );
                    }

                }); //todo set limit
                //callback();
            })

    }

    this.startMainCron = function () {
        mainCounter++;
        var job0 = crontab.scheduleJob('*/5 * * * * *', function( locCounter ) {
            console.log( locCounter +' Main cron executed' );
            addJobsForUsers( /*function(err){
                if (err) {
                    console.log('Error');
                }
            }*/)
        }, [mainCounter], null, true );

        jobArray.push( job0.toString() );
    };

    this.getJobs = function () {
        return jobArray;
    };

    this.deleteJob = function ( id ) {
        var index = jobArray.indexOf( id );
        crontab.cancelJob( id );

        jobArray.splice( index, 1 )
    }
};