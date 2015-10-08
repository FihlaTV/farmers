var _ = require('lodash');
var SessionHandler = require('./sessions');
var RESPONSE = require('../constants/response');
var CONST = require('../constants/constants');
var csv = require('csv');
var fs = require('fs');
var async = require('async');

//var PlantsHelper = require("../helpers/plants");
//var ValidationHelper = require("../helpers/validation");


var Marketeer = function (db) {
    'use strict';

    var Marketeer = db.model(CONST.MODELS.MARKETEER);
    var NewMarketeer = db.model(CONST.MODELS.NEW_MARKETEER);
    var User = db.model(CONST.MODELS.USER);
    var mongoose = require('mongoose');
    var path = require('path');
    var session = new SessionHandler(db);

    this.adminCreateNewMarketeer = function (req, res, next) {
        var fullName = req.body.fullName;
        var location = req.body.location;
        var logo = req.body.logo;
        var data = {
            fullName: fullName,
            location: location
        };
        var marketeer = new Marketeer(data);

        marketeer
            .save(function (err, model) {

                if (err) {
                    return res.status(500).send({error: err});
                }

                return res.status(200).send({success: RESPONSE.ON_ACTION.SUCCESS});
            });
    };

    this.adminAddNewMarketeer = function (req, res, next) {
        return res.status(500).send({error: 'NOT Implemented'});
    };

    this.adminMergeMarketeer = function (req, res, next) {
        return res.status(500).send({error: 'NOT Implemented'});
    };

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
                        fullName: item[1],
                        location: item[0]
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
        var marketeerFullName = req.body.fullName;
        var userId = req.session.uId;

        Marketeer
            .findOne({"fullName": marketeerFullName})
            .lean()
            .exec(function (err, model) {
                var newMarketeer;

                if (err) {
                    return res.status(500).send({error: err});
                }

                if (model) {
                    console.log(userId);

                    User
                        .findOneAndUpdate({'_id': userId}, {'marketeer': model._id})
                        .exec(function (err, model) {
                            if (err) {
                                return res.status(500).send({error: err});
                            }
                            console.log('Update marketeer: ', model);
                            return res.status(200).send({success: RESPONSE.ON_ACTION.SUCCESS});
                        });
                } else {
                    console.log(userId);


                    User
                        .findOneAndUpdate({'_id': userId}, {'newMarketeer': true})
                        .exec(function (err, model) {
                            if (err) {
                                return res.status(500).send({error: err});
                            }
                            console.log('New marketeer: ', model);

                            newMarketeer = new NewMarketeer({'user': userId, 'fullName': marketeerFullName});

                            newMarketeer
                                .save(function (err, model) {
                                    if (err) {
                                        return res.status(500).send({error: err});
                                    }
                                    return res.status(201).send({success: RESPONSE.ON_ACTION.SUCCESS});
                                });
                        });
                }
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

                console.log(marketeerList);
                return res.status(200).send(marketeerList);
            })
    };
};

module.exports = Marketeer;