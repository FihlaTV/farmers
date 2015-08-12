/**
 * Created by User on 27.05.2015.
 */
var lodash = require('lodash');
var async = require('async');

var user = function(){

    function guidGenerator() {
        var S4 = function() {
            return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
        };
        return (S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4());
    }

    function createUser(UserModel, callback){

        var userModel;

        var user = {
            deviceId: guidGenerator(),
            timeZone: 0
        };

        userModel = new UserModel(user);

        userModel.save(function(err){
            if (err){
                return callback(err);
            }

            callback(null, userModel);
        });


    }

    function createPlan(createMsgPlan, userId, callback){
        createMsgPlan(userId, false, callback)
    }

    function createHistory(Plan, MsgHistory, userId, callback){

        var historyObj;
        var historyModel;

        Plan.find({refUser: userId}, function (err, result) {
            if (err) {
                return callback(err);
            }

            if (!result.length) {
                err = new Error('Plan not found');
                err.status = 400;
                return callback(err);
            }

            async.each(result,
                function (plan, cb) {
                    if (plan.messageType === 'lesson'){

                        historyObj = {
                            userId: plan.refUser,
                            msgId: plan.messageId,
                            msgType: 'L'
                        };

                        historyModel = new MsgHistory(historyObj);

                        historyModel.save(function(err){
                            if (err){
                                return cb(err);
                            }

                            cb(null);
                        });
                    } else {
                        cb(null);
                    }
                },
                function (err) {
                    if (err) {
                        return callback(err);
                    }
                    callback(null);
                });
        });
    }

    return {
        createUser: createUser,
        createPlan: createPlan,
        createHistory: createHistory
    };

};

module.exports = user;