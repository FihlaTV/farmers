/**
 * Created by kille on 12.08.2015.
 */

//var mongoose = require('mongoose');
var ImportCsv = require('../helpers/import');
var constants = require("../constants/constants");
var async = require('async');
var moment = require("moment");
var _ = require('lodash');

var Vegetable = function (db) {
    var Vegetable = db.model('Vegetable');
    var Price = db.model('Price');
    var importCsv = new ImportCsv(db);
    var self = this;

    function getTransformedDateOject(date) {
        date = date.split('/');

        return new Date(date[2] + '/' + date[1] + '/' + date[0]);
    }

    function getAllVegetables(cb) {
        Vegetable.find({}).exec(cb);
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
                getAllVegetables(cb)
            }
        ], function (err, results) {
            if (err) {
                cb(err);
            } else {
                cb(null, {
                    newVegetablesPrice: results[0],
                    vegetables: results[1]
                });
            }
        })
    }

    function saveVegetablePrice(vagetable, newVagetablePriceObj, cb) {
        var maxPrice = parseFloat(newVagetablePriceObj.maxPrice) || 0;
        var minPrice = parseFloat(newVagetablePriceObj.minPrice) || 0;
        var date = getTransformedDateOject(newVagetablePriceObj.date);
        var avgPrice;
        var saveOptions;

        if ((minPrice === 0) || (maxPrice === 0)) {
            avgPrice = (minPrice === 0) ? maxPrice : minPrice;
        } else {
            avgPrice = (minPrice + maxPrice) / 2;
        }


        saveOptions = {
            _vegetable: vagetable._id,
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


    function findVegetableAndSavePrice(vegetables, newVegetablePrice, cb) {
        var flag = false;

        async.each(vegetables, function (vegetable, cb) {
            if (vegetable.jewishNames.indexOf(newVegetablePrice.jewishNames) !== -1) {
                saveVegetablePrice(vegetable, newVegetablePrice, cb);
                flag = true;
            } else {
                cb();
            }
        }, function (err, result) {
            if (err) {
                cb(err)
            } else {
                if (!flag) {
                    Vegetable
                        .create(newVegetablePrice, function (err, vegetable) {
                            if (err) {
                                cb(err);
                            } else {
                                saveVegetablePrice(vegetable, newVegetablePrice, function (err, price) {
                                    cb(err, vegetable);
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
                async.eachSeries(resultObj.newVegetablesPrice, function (newVegetablePrice, cb) {
                    findVegetableAndSavePrice(resultObj.vegetables, newVegetablePrice, function (err, newVegetable) {
                        if (err) {
                            cb(err)
                        } else if (newVegetable && newVegetable._id) {
                            resultObj.vegetables.push(newVegetable);
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

    this.importUniqVegetablesToDb = function (req, res, next) {
        var csvFile = constants.CSV_FILES.MAIN_VEGETABLES;

        importCsv.parseCsvData(csvFile, function (err, jsonData, attributes) {
            if (err) {
                return next(err);
            } else {
                Vegetable.create(jsonData, function (err, cteatedData) {
                    if (err) {
                        return next(err);
                    } else {
                        res.status(200).send(cteatedData);
                    }
                });
            }
        });
    };

    this.getList = function (req, res, next) {

        Vegetable.find({}, {englishName: 1, jewishNames: 1}, function (err, docs) {
            if (err) {
                return next(err);
            } else {
                res.status(200).send(docs);
            }
        });
    };

    this.getVegetablesWithPrices = function (req, res, next) {
        var date;
        var dateString = req.query.date;

        if (dateString && constants.REG_EXPS.VEGETABLE_PRICES_BY_DATE.test(dateString)) {
            date = new Date(dateString.replace(/-/g, '/'));
        } else {
            date = new Date();
        }

        var year = moment(date).year();
        var dayOfYear = moment(date).dayOfYear();
        var index;

        async.waterfall([

            // get all vegetables from db
            function (cb) {
                getAllVegetables(function (err, vegetables) {
                    if (err) {
                        cb(err);
                    } else {
                        cb(null, vegetables);
                    }
                });

                //get all prices group by vegetables id
            },
            function (vegetables, cb) {

                Price
                    .aggregate([
                        {
                            $match: {
                                year: year,
                                dayOfYear: dayOfYear
                            }
                        }, {
                            $group: {
                                _id: '$_vegetable',
                                prices: {
                                    $push: {
                                        minPrice: '$minPrice',
                                        maxPrice: '$maxPrice',
                                        avgPrice: '$avgPrice',
                                        source: '$source',
                                        date: '$date'
                                    }
                                }
                            }
                        }])
                    .exec(function (err, prices) {
                        if (err) {
                            cb(err);
                        } else {
                            async.map(vegetables, function (vegetable, cb) {
                                index = _.findIndex(prices, '_id', vegetable._id);
                                vegetable = vegetable.toJSON();

                                if (index !== -1) {
                                    vegetable.prices = prices[index].prices;
                                } else {
                                    vegetable.prices = [];
                                }
                                cb(err, vegetable);
                            }, cb);
                        }
                    });
            }

        ], function (err, result) {
            if (err) {
                next(err);
            } else {
                res.status(200).send(result);
            }
        })
    };
};

module.exports = Vegetable;