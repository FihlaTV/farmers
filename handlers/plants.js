/**
 * Created by kille on 12.08.2015.
 */

//var mongoose = require('mongoose');
var ImportCsv = require('../helpers/import');
var constants = require("../constants/constants");
var async = require('async');
var moment = require("moment");
var _ = require('lodash');

var PlantsHelper = require("../helpers/plants");
var ValidationHelper = require("../helpers/validation");


var Plant = function (db) {
    var Plant = db.model('Plant');
    var Price = db.model('Price');

    var importCsv = new ImportCsv(db);

    var plantsHelper = new PlantsHelper(db);
    var validationHelper = new ValidationHelper(db);

    var self = this;

    function getTransformedDateOject(date) {
        date = date.split('/');

        return new Date(date[2] + '/' + date[1] + '/' + date[0]);
    }

    function getAllPlants(cb) {
        Plant.find({}).exec(cb);
    }

    function prepareData(csvFile, cb) {
        async.parallel([
            function (cb) {
                importCsv.parseCsvData(csvFile, function (err, jsonData, attributes) {
                    if (err) {
                        cb(err);
                    } else {
                        cb(null, jsonData);
                    }
                })
            },
            function (cb) {
                getAllPlants(cb)
            }
        ], function (err, results) {
            if (err) {
                cb(err);
            } else {
                cb(null, {
                    newPlantsPrice: results[0],
                    plants: results[1]
                });
            }
        })
    }

    function savePlantPrice(plant, newPlantPriceObj, cb) {
        var maxPrice = parseFloat(newPlantPriceObj.maxPrice) || 0;
        var minPrice = parseFloat(newPlantPriceObj.minPrice) || 0;
        var date = getTransformedDateOject(newPlantPriceObj.date);
        var avgPrice;
        var saveOptions;

        if ((minPrice === 0) || (maxPrice === 0)) {
            avgPrice = (minPrice === 0) ? maxPrice : minPrice;
        } else {
            avgPrice = (minPrice + maxPrice) / 2;
        }


        saveOptions = {
            _plant: plant._id,
            source: constants.URL_APIS.PLANTS_URL.SOURCE,
            minPrice: minPrice,
            maxPrice: maxPrice,
            avgPrice: avgPrice,

            date: date,
            year: moment(date).year(),
            dayOfYear: moment(date).dayOfYear()
        };

        Price.create(saveOptions, cb);
    }

    function findPlantAndSavePrice(plants, newPlantPrice, cb) {
        var flag = false;

        async.each(plants, function (plant, cb) {
            if (plant.jewishNames.indexOf(newPlantPrice.jewishNames) !== -1) {
                savePlantPrice(plant, newPlantPrice, cb);
                flag = true;
            } else {
                cb();
            }
        }, function (err, result) {
            if (err) {
                cb(err)
            } else {
                if (!flag) {
                    Plant
                        .create(newPlantPrice, function (err, plant) {
                            if (err) {
                                cb(err);
                            } else {
                                savePlantPrice(plant, newPlantPrice, function (err, price) {
                                    cb(err, plant);
                                });
                            }
                        });

                } else {
                    cb();
                }
            }
        });
    }

    this.importFromCsv = function (req, res, next) {
        var year = req.query.year;
        var csvFile;

        if (year === '2013') {
            csvFile = constants.CSV_FILES.VEGETABLES_WITH_PRICES_2013;
        } else if (year === '2014') {
            csvFile = constants.CSV_FILES.VEGETABLES_WITH_PRICES_2014;
        } else if (year === '2015') {
            //csvFile = constants.CSV_FILES.VEGETABLES_WITH_PRICES_2015; //change when will have data for 2015 year
            return res.status(200).send('No file with such year');
        } else {
            return res.status(200).send('No file with such year');
        }

        prepareData(csvFile, function (err, resultObj) {
            if (err) {
                next(err);
            } else {
                async.eachSeries(resultObj.newPlantsPrice, function (newPlantPrice, cb) {
                    findPlantAndSavePrice(resultObj.plants, newPlantPrice, function (err, newPlant) {
                        if (err) {
                            cb(err)
                        } else if (newPlant && newPlant._id) {
                            resultObj.plants.push(newPlant);
                            cb();
                        } else {
                            cb();
                        }
                    });
                }, function (err) {
                    if (err) {
                        next(err);
                    } else {
                        res.status(200).send('Import was successful')
                    }
                });
            }
        });
    };

    this.getList = function (req, res, next) {
        Plant.find({}, function (err, docs) {
            if (err) {
                return next(err);
            } else {
                res.status(200).send(docs);
            }
        });
    };

    this.getPlantsWithPrices = function (req, res, next) {
        var date = req.query.date;

        date = validationHelper.convertUrlStringDate(date);

        plantsHelper.getPlantsWithPrices(date, function (err, result) {
            if (err) {
                next(err);
            } else {
                res.status(200).send(result);
            }
        })
    };

};

module.exports = Plant;