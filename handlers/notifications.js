var CONST = require('../constants/constants');
var _ = require('lodash');
var csv = require('csv');
var fs = require('fs');
var async = require('async');


var Notification = function (db) {
    'use strict';

    var Notification = db.model(CONST.MODELS.NOTIFICATION);
    var mergedNewCrops = [];


    this.getMergedNotification = function (req, res, next) {
        Notification
            .aggregate([
                {
                    $match: {
                    }
                }, {
                    $group: {
                        _id: '$cropName',

                        duplicate: {
                            $push: {
                                'source': '$source',
                                'cropName': '$cropName'
                            }
                        }
                    }
                },
                {
                    $sort: {_id: 1}
                }
            ])
            .exec(function (err, results) {
                if (err) {
                    return next(err);
                }

                for (var i = results.length - 1; i >= 0; i-- ){
                    mergedNewCrops.push ( {cropName: results[i]._id,  source: /moag/.test(results[i].duplicate[0].source) ? CONST.WHOLE_SALE_MARKET : CONST.PLANT_COUNCIL  } );
                }

                console.log('cropListMerged.length: ', mergedNewCrops.length);
                res.status(200).send(mergedNewCrops);
            });
    };




};

module.exports = Notification;