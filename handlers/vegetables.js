/**
 * Created by kille on 12.08.2015.
 */

//var mongoose = require('mongoose');
var ImportCsv = require('../helpers/import');
var constants = require("../constants/constants");
var async = require('async');
var moment = require("moment");

var Vegetable = function (db) {
    var Vegetable = db.model('Vegetable');
    var Price = db.model('Price');
    var importCsv = new ImportCsv(db);
    var self = this;

    function getTransformedDateOject(date) {
        date = date.split('/');

        return new Date(date[2] + '/' + date[1] + '/' + date[0]);
    };

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
            minPrice: minPrice,
            maxPrice: maxPrice,
            avgPrice: avgPrice,

            date: date,
            year: moment(date).year(),
            dayOfYear: moment(date).dayOfYear()
        };

        Price.create(saveOptions, function (err, res) {
            cb(err)
        });
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
                                saveVegetablePrice(vegetable, newVegetablePrice, cb);
                            }
                        });
                }
                cb();
            }
        });
    }

    function getAllVegetables(cb) {
        Vegetable.find({}).exec(cb);
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

    this.importFromCsv = function (req, res, next) {
        var year = req.query.year;
        var csvFile;

        if (year === '2013') {
            csvFile = constants.CSV_FILES.VEGETABLES_WITH_PRICES_2013;
        } else if (year === '2014') {
            csvFile = constants.CSV_FILES.VEGETABLES_WITH_PRICES_2014;
        } else {
            return res.status(200).send('No file with such year');
        }

        prepareData(csvFile, function (err, resultObj) {
            if (err) {
                next(err);
            } else {
                async.each(resultObj.newVegetablesPrice, function (newVegetablePrice, cb) {
                    findVegetableAndSavePrice(resultObj.vegetables, newVegetablePrice, cb);
                }, function (err) {
                    if (err) {
                        next(err);
                    } else {
                        res.status(200).send('Import was successful')
                    }
                });
            }
        });


        /*importCsv.parseCsvData(csvFile, function (err, jsonData, attributes) {
         if (err) {
         return next(err);
         } else {

         async.waterfall([
         //find vegetables
         function (callback) {
         Vegetable.find({}).exec(function (err, vegetables) {
         if (err) {
         callback(err);
         } else {
         callback(null, vegetables);
         }
         });

         //update prices
         }, function (vegetables, callback) {

         async.each(jsonData, function (element, cb) {

         for (var i = vegetables.length - 1; i >= 0; i--) {
         if (vegetables[i].jewishNames.indexOf(element.jewishNames) !== -1) {
         date = getTransformedDateOject(element.date);
         minPrice = parseFloat(element.minPrice);
         maxPrice = parseFloat(element.maxPrice);

         if ((minPrice === 0) || (maxPrice === 0)) {
         avgPrice = (minPrice === 0) ? maxPrice : minPrice;
         } else {
         avgPrice = (minPrice + maxPrice) / 2;
         }

         saveOptions = {
         _vegetable: vegetables[i]._id,
         minPrice: minPrice,
         maxPrice: maxPrice,
         avgPrice: avgPrice,

         date: date,
         year: moment(date).year(),
         dayOfYear: moment(date).dayOfYear()
         };

         Price.create(saveOptions, function (err, res) {
         if (err) {
         cb(err)
         }
         });
         flag = true;
         }

         if (flag === true) {
         cb();
         } else {
         Vegetable.create(element, function (err, veg) {
         if (err) {
         cb(err)
         } else {
         minPrice = parseFloat(element.minPrice);
         maxPrice = parseFloat(element.maxPrice);

         if ((minPrice === 0) || (maxPrice === 0)) {
         avgPrice = (minPrice === 0) ? maxPrice : minPrice;
         } else {
         avgPrice = (minPrice + maxPrice) / 2;
         }

         saveOptions = {
         _vegetable: veg._id,
         minPrice: minPrice,
         maxPrice: maxPrice,
         avgPrice: avgPrice,

         date: date,
         year: moment(date).year(),
         dayOfYear: moment(date).dayOfYear()
         };

         Price.create(saveOptions, function (err, res) {
         if (err) {
         cb(err)
         }
         });
         vegetables.push(veg);
         cb();
         }
         });
         }

         }


         }, function (err, newJsonData) {
         if (err) {
         callback(err);
         } else {
         callback(null, newJsonData);


         }
         });


         }], function (err, result) {
         if (err) {
         next(err);
         } else {
         res.status(200).send(result);
         }
         });


         //jsonData.date = getTransformedDateOject(jsonData.date);


         */
        /*Vegetable.create(jsonData, function (err, cteatedData) {
         if (err) {
         return next(err);
         } else {
         res.status(200).send(cteatedData);
         }
         });*/
        /*
         }
         });*/
    };
};

module.exports = Vegetable;