var _ = require('lodash');
var SessionHandler = require('./sessions');
var RESPONSE = require('../constants/response');
var CONST = require('../constants/constants');
var csv = require('csv');
var fs = require('fs');
var async = require('async');
var mongoose = require('mongoose');
var path = require('path');
var mailer = require('../helpers/mailer');

var Marketeer = function (db) {
    'use strict';

    var Marketeer = db.model(CONST.MODELS.MARKETEER);
    var Notification = db.model(CONST.MODELS.NOTIFICATION);
    var User = db.model(CONST.MODELS.USER);
    var ObjectId = mongoose.Types.ObjectId;
    var session = new SessionHandler(db);
    var UserId = null;
    var inputMarketeerName = null;

    function getUserProfile(cb) {
        User
            .findById(UserId)
            .lean()
            .exec(function (err, model) {
                if (err) {
                    return cb(err)
                }
                return cb(null, model);
            })
    }

    function checkFlagCanChangeMarketeer(userProfile, cb) {
        if (!userProfile.canChangeMarketeer) {
            return cb({blocked:true})
        }
        return cb(null, userProfile);
    }

    function checkIfExistMarketer(userProfile, cb) {
        Marketeer
            .findOne({"fullName": inputMarketeerName})
            .lean()
            .exec(function (err, model) {

                if (err) {
                    return cb(err)
                }

                if (model) {
                    console.log(model);
                    return cb(null, userProfile, model, {isNewMarketeer: false})
                }
                return cb(null, userProfile, model, {isNewMarketeer: true})
            })
    }
    function updateUserProfileAndCreateNotification (userProfile, marketeerModel, marketeerStatus, cb) {
        var notification;
        var updateOptions ={
            newMarketeer: marketeerStatus.isNewMarketeer,
            marketeer: !marketeerStatus.isNewMarketeer ? marketeerModel._id : null,
            updatedAt: new Date()
        };

        User
            .findOneAndUpdate({'_id': UserId}, updateOptions)
            .exec(function (err, model) {
                if (err) {
                    return res.status(500).send({error: err});
                }

                if (marketeerStatus.isNewMarketeer){
                    //TODO
                    // mailer.sendEmailNotificationToAdmin('4Farmers. User add new marketeer ', 'Hello. User ' + userProfile.fullName +' add marketeer that is not in Marketeers list. Added name:  ' + inputMarketeerName);
                } else {
                    //TODO
                    //mailer.sendEmailNotificationToAdmin('4Farmers. User change marketeer ', 'Hello. User ' + userProfile.fullName +' change marketeer. New name:  ' + inputMarketeerName);
                }

                notification = new Notification({'user': UserId, 'marketeerName': inputMarketeerName, type: marketeerStatus.isNewMarketeer ? 'newMarketeer' : 'changeMarketeer'});
                notification
                    .save(function (err, model) {
                        if (err) {
                            return cb(err);
                        }
                        return cb(null);
                    });
            });
    }

    this.adminGetMarketeersList = function (req, res, next) {
        Marketeer
            .find()
            .select('_id fullName location')
            .lean()
            .exec( function (err, results) {

                if (err) {
                    return res.status(500).send({error: err});
                }

                return res.status(200).send({data: results});
            });
    };

    this.adminCreateMarketeer = function (req, res, next) {
        var newMarketeer = req.body;
        var marketeer;

        if (!newMarketeer || !newMarketeer.fullName || !newMarketeer.location ){
            return res.status(400).send({error: RESPONSE.ON_ACTION.BAD_REQUEST});
        }

        marketeer = new Marketeer(newMarketeer);
        marketeer.save(function(err){
            if (err) {
                return res.status(500).send({error: err});
            }

            return res.status(200).send({data: {_id: marketeer._id, fullName :  marketeer.fullName, location :  marketeer.location }});
        });
    };

    this.adminUpdateMarketeer = function (req, res, next) {

        var marketeerId = req.params.id;
        var newMarketeerData = req.body;

        newMarketeerData.updatedAt = new Date();

        if (!newMarketeerData || !newMarketeerData.fullName || !newMarketeerData.location || !ObjectId.isValid(marketeerId)){
            return res.status(400).send({error: RESPONSE.ON_ACTION.BAD_REQUEST});
        }

        Marketeer
            .findByIdAndUpdate(marketeerId,newMarketeerData, { new: true })
            .exec(function(err, result){
                if (err) {
                    return res.status(500).send({error: err});
                }

                return res.status(200).send({data: {_id: result._id, fullName :  result.fullName, location :  result.location }});
            });
    };

    this.adminDeleteMarketeer = function (req, res, next) {

        var marketeerId = req.params.id;
        if ( !ObjectId.isValid(marketeerId)){
            return res.status(400).send({error: RESPONSE.ON_ACTION.BAD_REQUEST});
        }

        Marketeer
            .findByIdAndRemove(marketeerId)
            .exec(function(err, result){
                if (err) {
                    return res.status(500).send({error: err});
                }

                return res.status(200).send({success: RESPONSE.ON_ACTION.SUCCESS });
            });
    };


    //this.adminUpdateMarketeersList = function (req, res, next) {
    //    var marketeerList = req.body.marketeerList;
    //    var marketeer;
    //
    //    if (!marketeerList || !marketeerList.length){
    //        return res.status(400).send({error: RESPONSE.ON_ACTION.BAD_REQUEST});
    //    }
    //
    //    async.each(marketeerList, function (item, callback) {
    //
    //        if (item._id) {
    //    //             Marketeer
    //                 .findOneAndUpdate({_id: item._id}, item, {upsert: true})
    //                 .exec(callback)
    //
    //         } else {
    //
    //            marketeer = new Marketeer (item);
    //
    //            marketeer
    //                .save(callback)
    //        }
    //
    //    }, function (err) {
    //        if (err) {
    //            return res.status(500).send({error: err});
    //        }
    //        return res.status(200).send({data: RESPONSE.ON_ACTION.SUCCESS});
    //    });
    //};




    this.adminImportFromCsv = function (req, res, next) {
        var csvFileName =  CONST.CSV_FILES.MARKETEER;

        fs.readFile(csvFileName, 'utf8', function (err, stringFileData) {
            if (err) {
                return res.status(500).send({error: err});
            }

            csv.parse(stringFileData, {delimiter: ',', relax: true}, function (err, parsedData) {
                if (err) {
                    return res.status(500).send({error: err});
                }

                async.each(parsedData, function (item, callback) {
                    var data = {
                        fullName: item[1].trim(),
                        location: item[0].trim()
                    };
                    var marketeer = new Marketeer(data);

                    marketeer
                        .save(function (err, model) {
                            if (err) {
                                callback('DB err:' + err);
                            } else {
                                callback();
                            }
                        });
                }, function (err) {
                    if (err) {
                        return res.status(400).send({error: err});
                    }

                    console.log('All items have been processed successfully');
                    return res.status(200).send({success: parsedData.length + ' marketeers was imported'});
                });
            });
        });
    };



    this.addMarketeer = function (req, res, next) {
        var tasks = [];

        UserId = req.session.uId;
        inputMarketeerName = req.body.fullName;
        console.log(inputMarketeerName);

        if (!inputMarketeerName) {
            return res.status(400).send(RESPONSE.ON_ACTION.BAD_REQUEST);
        }

        tasks.push(getUserProfile);
        tasks.push(checkFlagCanChangeMarketeer);
        tasks.push(checkIfExistMarketer);
        tasks.push(updateUserProfileAndCreateNotification);
        async.waterfall(tasks,function (err) {
            if(err && err.blocked) {
                return res.status(400).send({error: RESPONSE.NOT_ALLOW_CHANGE_MARKETEER});
            }
            if(err) {
                return res.status(500).send(err);
            }
            return res.status(200).send({success: RESPONSE.ON_ACTION.SUCCESS});
        });
    };

    this.getMarketeerList = function (req, res, next) {
        Marketeer
            .find()
            .lean()
            .exec(function (err, models) {
                var marketeerList = [];

                if (err) {
                    return res.status(500).send({error: err});
                }

                if (!models.length) {
                    return res.status(200).send([]);
                }

                for (var len = models.length - 1, i = len; i >= 0; i--) {
                    marketeerList.push(models[len - i].fullName);
                }

                //console.log(marketeerList);
                return res.status(200).send(marketeerList);
            })
    };

    this.getMarketeerBySession = function (req, res, next) {
        var userId = req.session.uId;
        var resultObj = {};

        User
            .findById(userId)
            .populate({path: 'marketeer', select: '_id fullName location'})
            .lean()
            .exec(function (err, model) {
                if (err) {
                    return res.status(500).send({error: err});
                }
                console.log('Update marketeer: ', model);
                if (model.marketeer) {
                    resultObj._marketeer = model.marketeer._id;
                }
                resultObj.fullName =  model.marketeer ? model.marketeer.fullName : null;
                resultObj.location = model.marketeer ? model.marketeer.location : null;

                resultObj.newMarketeer = model.newMarketeer;
                resultObj.canChangeMarketeer = model.canChangeMarketeer;
                return res.status(200).send(resultObj);
            });
    }
};

module.exports = Marketeer;