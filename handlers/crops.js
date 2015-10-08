var CONST = require('../constants/constants');
var _ = require('lodash');
var csv = require('csv');
var fs = require('fs');
var async = require('async');

//var PlantsHelper = require("../helpers/plants");
//var ValidationHelper = require("../helpers/validation");


var Crop = function (db) {
    'use strict';

    var Crop = db.model(CONST.MODELS.CROP);

    this.getList = function (req, res, next) {
        Crop.find({}, function (err, docs) {
            if (err) {
                return next(err);
            } else {
                res.status(200).send(docs);
            }
        });
    };

    this.adminImportFromCsv = function (req, res, next) {
        var csvFileName =  CONST.CSV_FILES.CROP_LIST;
        var mergedData =[];
        var j = 0;

        fs.readFile(csvFileName, 'utf8', function (err, stringFileData) {
            if (err) {
                return res.status(500).send({error: err});
            }

            csv.parse(stringFileData, {delimiter: ',', relax: true}, function (err, parsedData) {
                if (err) {
                    return res.status(500).send({error: err});
                }

                // MERGE loaded by display Name
                mergedData.push(parsedData[0]);

                for (var i = 1, len = parsedData.length; i < len; i++){
                    if (mergedData[j][3] === parsedData[i][3]) {
                        mergedData[j][0] = mergeValueToFirst (mergedData[j][0], parsedData[i][0]);
                        mergedData[j][1] = mergeValueToFirst (mergedData[j][1], parsedData[i][1]);
                    } else {
                        j++;
                        mergedData[j] =  parsedData[i];
                    }
                }

                function mergeValueToFirst (item1, item2 ) {
                    var tempStr;

                    if (item2) {

                        if (Array.isArray(item1)) {
                            item1.push(item2)
                        } else {
                            tempStr = item1;
                            item1 = [tempStr, item2];
                        }
                    }
                    return item1;
                }



                async.eachSeries(mergedData, function (item, callback) {
                    var data = {
                        englishName: item[2],
                        displayName: item[3],
                        wholeSaleNames: item[0],
                        plantCouncilNames: item[1]
                    };
                    var crop = new Crop(data);

                    crop
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
                    return res.status(200).send({success: parsedData.length + ' crops was imported and Merged in ' + mergedData.length + ' items of cropList'});
                });
            });
        });
    };


};

module.exports = Crop;