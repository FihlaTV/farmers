var PlantsHelper = require("../helpers/plants");
var csv = require('csv');
var fs = require('fs');
var _ = require('lodash');
var constants = require("../constants/constants");
var async = require('async');
var moment = require("moment");

module.exports = function (db) {
    var Plant = db.model('Plant');
    var Price = db.model('Price');

    var plantsHelper = new PlantsHelper(db);
    var self = this;

    function getTransformedDateOject(date) {
        date = date.split('/');

        return new Date(date[2] + '/' + date[1] + '/' + date[0]);
    }

    this.getCsvFileName = function (year) {

        if (year === '2013') {
            return constants.CSV_FILES.VEGETABLES_WITH_PRICES_2013;
        } else if (year === '2014') {
            return constants.CSV_FILES.VEGETABLES_WITH_PRICES_2014;
        } else if (year === '2015') {
            //return constants.CSV_FILES.VEGETABLES_WITH_PRICES_2015; //change when will have data for 2015 year
            return '';
        } else {
            return '';
        }
    };

    this.prepareData = function (csvFile, cb) {
        async.parallel([
            function (cb) {
                self.parseCsvData(csvFile, function (err, jsonData, attributes) {
                    if (err) {
                        cb(err);
                    } else {
                        cb(null, jsonData);
                    }
                })
            },
            function (cb) {
                Plant.find({}).exec(cb);
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
    };

    function savePlantPrice(plant, newPlantPriceObj, cb) {
        var maxPrice = parseFloat(newPlantPriceObj.maxPrice) || 0;
        var minPrice = parseFloat(newPlantPriceObj.minPrice) || 0;
        var date = getTransformedDateOject(newPlantPriceObj.date);
        var avgPrice = plantsHelper.getAvgPrice(minPrice, maxPrice);
        var saveOptions;

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

    this.findPlantAndSavePrice = function (plants, newPlantPrice, cb) {
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
    };

    this.parseCsvData = function (csvFile, callback) {

        var attributes; //first row - header of csv data

        fs.readFile(csvFile, 'utf8', function (err, stringFileData) {
            if (err) {
                callback(err);
            } else {
                csv.parse(stringFileData, {delimiter: ',', relax: true}, function (err, parsedData) {
                    if (err) {
                        callback(err);
                    }
                    csv.transform(parsedData,
                        function (row) {
                            if (!attributes) {
                                attributes = row;
                                return null;
                            }
                            return row;
                        },
                        function (err, rows) {
                            var jsonData = _.map(rows, function (row) {
                                return _.object(attributes, row);
                            });
                            callback(null, jsonData, attributes);
                        })
                })
            }
        });
    };

};