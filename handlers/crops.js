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
    var  cropListMerged = [];

    this.getMergedCropList = function (req, res, next) {
        Crop
            .find({})
            .sort({'order': 1})
            .select('englishName displayName')
            .lean()
            .exec(function (err, docs) {
                if (err) {
                    return next(err);
                } else {
                    cropListMerged.push(
                        {
                            englishName: docs[0].englishName,
                            displayName: docs[0].displayName
                        }
                    );

                    console.log('docs.length: ', docs.length);

                    for (var i = 1, len = docs.length - 1; i <= len; i++ ){
                        if (docs[i-1].displayName !== docs[i].displayName) {
                            cropListMerged.push(
                                {
                                    englishName: docs[i].englishName,
                                    displayName: docs[i].displayName
                                }
                            );
                        }
                    }

                    console.log('cropListMerged.length: ', cropListMerged.length);
                    res.status(200).send(cropListMerged);
                }
            });
    };


    // OLD Version (for cropList_old_1.csv)

    //this.adminImportFromCsv = function (req, res, next) {
    //    var csvFileName =  CONST.CSV_FILES.CROP_LIST;
    //    var mergedData =[];
    //    var j = 0;
    //
    //    fs.readFile(csvFileName, 'utf8', function (err, stringFileData) {
    //        if (err) {
    //            return res.status(500).send({error: err});
    //        }
    //
    //        csv.parse(stringFileData, {delimiter: ',', relax: true}, function (err, parsedData) {
    //            if (err) {
    //                return res.status(500).send({error: err});
    //            }
    //
    //            // MERGE loaded by display Name
    //            mergedData.push(parsedData[0]);
    //
    //            for (var i = 1, len = parsedData.length; i < len; i++){
    //                if (mergedData[j][3] === parsedData[i][3]) {
    //                    mergedData[j][0] = mergeValueToFirst (mergedData[j][0], parsedData[i][0]);
    //                    mergedData[j][1] = mergeValueToFirst (mergedData[j][1], parsedData[i][1]);
    //                } else {
    //                    j++;
    //                    mergedData[j] =  parsedData[i];
    //                }
    //            }
    //
    //            function mergeValueToFirst (item1, item2 ) {
    //                var tempStr;
    //
    //                if (item2) {
    //
    //                    if (Array.isArray(item1)) {
    //                        item1.push(item2)
    //                    } else {
    //                        tempStr = item1;
    //                        item1 = [tempStr, item2];
    //                    }
    //                }
    //                return item1;
    //            }
    //
    //
    //
    //            async.eachSeries(mergedData, function (item, callback) {
    //                var data = {
    //                    englishName: item[2],
    //                    displayName: item[3],
    //                    wholeSaleNames: item[0],
    //                    plantCouncilNames: item[1],
    //                    image: null
    //                };
    //                var crop = new Crop(data);
    //
    //                crop
    //                    .save(function (err, model) {
    //                        if (err) {
    //                            callback('DB err:' + err);
    //                        } else {
    //                            callback();
    //                        }
    //                    });
    //            }, function (err) {
    //                if (err) {
    //                    return res.status(400).send({error: err});
    //                }
    //
    //                console.log('All items have been processed successfully');
    //                return res.status(200).send({success: parsedData.length + ' crops was imported and Merged in ' + mergedData.length + ' items of cropList'});
    //            });
    //        });
    //    });
    //};

    // OLD Version (for cropList_old_2.csv)
    //this.adminImportFromCsv = function (req, res, next) {
    //    var csvFileName =  CONST.CSV_FILES.CROP_LIST;
    //    var mergedData = [];
    //    var parsedObj;
    //    var englishName;
    //    var displayName;
    //    var wholeSaleName;
    //    var kind;
    //    var varieties;
    //    var cropType;
    //    var plantCouncilName;
    //    var image;
    //    var order = 1;
    //
    //
    //    var j = 0;
    //
    //    fs.readFile(csvFileName, 'utf8', function (err, stringFileData) {
    //        if (err) {
    //            return res.status(500).send({error: err});
    //        }
    //
    //        csv.parse(stringFileData, {delimiter: ',', relax: true}, function (err, parsedData) {
    //            if (err) {
    //                return res.status(500).send({error: err});
    //            }
    //            //parsedData[0] - table heads
    //
    //            parsedObj = {
    //                englishName: parsedData[1][5],
    //                displayName: parsedData[1][0],
    //                plantCouncilName: parsedData[1][4],
    //                wholeSaleName: (parsedData[1][3] ? parsedData[1][3] + ' ' : '') + (parsedData[1][2] ? parsedData[1][2] + ' ' : '') + (parsedData[1][1] ? parsedData[1][1] + ' ' : ''),
    //                kind: parsedData[1][1],
    //                varieties: parsedData[1][2],
    //                type: parsedData[1][3],
    //                image: parsedData[1][6],
    //                order: order
    //            };
    //
    //
    //            // MERGE loaded by display Name
    //            mergedData.push(parsedObj);
    //
    //            for (var i = 2, len = parsedData.length; i < len; i++){
    //                if (parsedData[i - 1][0] !== parsedData[i][0]) {
    //                    order ++;
    //                }
    //                mergedData.push({
    //                    englishName: parsedData[i][5],
    //                    displayName: parsedData[i][0],
    //                    plantCouncilName: parsedData[i][4],
    //                    wholeSaleName: (parsedData[i][1] ? parsedData[i][1] : '') + (parsedData[i][2] ? ' ' + parsedData[i][2]: '') + (parsedData[i][3] ? ' ' + parsedData[i][3]: ''),
    //                    kind: parsedData[i][1],
    //                    varieties: parsedData[i][2],
    //                    type: parsedData[i][3],
    //                    image: parsedData[i][6],
    //                    order: order
    //                });
    //            }
    //
    //
    //            async.eachSeries(mergedData, function (item, callback) {
    //                var crop = new Crop(item);
    //                crop
    //                    .save(function (err, model) {
    //                        if (err) {
    //                            callback('DB err:' + err);
    //                        } else {
    //                            callback();
    //                        }
    //                    });
    //            }, function (err) {
    //                if (err) {
    //                    return res.status(400).send({error: err});
    //                }
    //
    //                console.log('All items have been processed successfully');
    //                return res.status(200).send({success: parsedData.length + ' crops was imported and Merged in ' + order + ' items of cropList'});
    //            });
    //
    //            //return res.status(200).send('DN: ' + parsedData[11][0] + ' cl: ' + parsedData[11][1] + ' va :'  + parsedData[11][2] + ' type: '  + parsedData[11][3] + ' Pn: '  + parsedData[11][4] + 'En: '  + parsedData[11][5]  + ' Image: '  + parsedData[11][6]);
    //        });
    //    });
    //};

    this.adminImportFromCsv = function (req, res, next) {
        var csvFileName =  CONST.CSV_FILES.CROP_LIST;
        var mergedData = [];
        var parsedObj;
        var order = 0;
        var pcName;
        var wsName;
        var j = 0;

        fs.readFile(csvFileName, 'utf8', function (err, stringFileData) {
            if (err) {
                return res.status(500).send({error: err});
            }

            csv.parse(stringFileData, {delimiter: ',', relax: true}, function (err, parsedData) {

                // sort by display name
                parsedData.sort(function compare(a, b) {
                    if (a[1].trim() < b[1].trim()) return -1;
                    if (a[1].trim() > b[1].trim()) return 1;
                    return 0;
                });

                if (err) {
                    return res.status(500).send({error: err});
                }
                db.collections['Crops'].drop();
                //parsedData[0] - table heads
                i = 1;

                //wsName = (parsedData[i][5] ? parsedData[i][5] : '') + (parsedData[i][6] ? ' ' + parsedData[i][6] : '') + (parsedData[i][7] ? ' ' + parsedData[i][7] : '');
                //pcName =  parsedData[i][2];

                wsName = parsedData[i][4].trim();
                pcName =  parsedData[i][2];

                parsedObj = {
                    englishName: parsedData[i][0].trim(),
                    displayName: parsedData[i][1].trim(),
                    plantCouncilName: pcName,
                    pcNameOptimize: pcName ? pcName.replace(/ /g, '') : '',
                    pcQuality: parsedData[i][3],
                    wholeSaleName: wsName,
                    wsNameOptimize: wsName ? wsName.replace(/ /g, '') : '',
                    kind: parsedData[i][5],
                    varieties: parsedData[i][6],
                    type: parsedData[i][7],
                    wsQuality: parsedData[i][8],
                    imported: parsedData[i][9] ? true : false,
                    image: 'img/crops/' + parsedData[i][10],
                    order: order
                };

                //MERGE loaded by display Name
                mergedData.push(parsedObj);

                for (var i = 2, len = parsedData.length -1 ; i <= len; i++){
                    if (parsedData[i - 1][1].trim() !== parsedData[i][1].trim()) {
                        order ++;
                    }

                    //wsName = (parsedData[i][5] ? parsedData[i][5] : '') + (parsedData[i][6] ? ' ' + parsedData[i][6] : '') + (parsedData[i][7] ? ' ' + parsedData[i][7] : '');
                    wsName = parsedData[i][4];
                    pcName = parsedData[i][2];

                    mergedData.push({
                        englishName: parsedData[i][0].trim(),
                        displayName: parsedData[i][1].trim(),
                        plantCouncilName: pcName,
                        pcNameOptimize: pcName ? pcName.replace(/ /g, '') : '',
                        pcQuality: parsedData[i][3],
                        //wholeSaleName:  (parsedData[i][5] ? parsedData[i][5] : '') + (parsedData[i][6] ? ' ' + parsedData[i][6] : '') + (parsedData[i][7] ? ' ' + parsedData[i][7] : ''),
                        wholeSaleName: wsName,
                        wsNameOptimize: wsName ? wsName.replace(/ /g, '') : '',
                        kind: parsedData[i][5],
                        varieties: parsedData[i][6],
                        type: parsedData[i][7],
                        wsQuality: parsedData[i][8],
                        imported: parsedData[i][9] ? true : false,
                        image: 'img/crops/' + parsedData[i][10],
                        order: order
                    });
                }


                async.eachSeries(mergedData, function (item, callback) {
                    var crop = new Crop(item);
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
                    return res.status(200).send({success: parsedData.length + ' crops was imported and Merged in ' + order + ' items of cropList'});
                });

                j = 11;

                //return res.status(200).send('EName: ' + parsedData[j][0] + ' DName: ' + parsedData[j][1] + ' PName :'  + parsedData[j][2] + ' PQuality: '  + parsedData[j][3] + ' WName: '  + parsedData[j][4] + ' WKind: '  + parsedData[j][5]  + ' WVar: '  + parsedData[j][6] + ' WType: '  + parsedData[j][7] + ' WQuality: '  + parsedData[j][8]  + ' Imported: '  + parsedData[j][9]  + ' Image: '  + parsedData[j][10]  + ' Image: '  + parsedData[j][11]);
                //return res.status(200).send(parsedObj);
            });
        });
    };


};

module.exports = Crop;