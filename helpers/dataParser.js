var request = require("request");
var moment = require("moment");
var async = require('async');
var constants = require("../constants/constants");

module.exports = function (db) {
    var Vegetable = db.model('Vegetable');
    var Price = db.model('Price');

    function getDateByUrl(url, cb) {
        request(url, function (err, response, body) {
            cb(err, JSON.parse(body));
        });
    }

    function getVegetables(cb) {
        Vegetable.find({}).exec(cb);
    }

    function getTransformedDateOject(date) {
        date = date.split('/');

        return new Date(20 + date[2] + '/' + date[1] + '/' + date[0]);
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
            source: newVagetablePriceObj.url,
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

    function createNewVegetable(newVagetablePriceObj, cb) {
        var saveOptions;

        saveOptions = {
            englishName: "No Name",
            jewishNames: [newVagetablePriceObj.jewishName]
        };

        if (newVagetablePriceObj.isNewVeg) {
            saveOptions.isNewVeg = true;
        }

        Vegetable.create(saveOptions, function (err, vegetable) {
            if (err) {
                cb(err);
            } else {
                saveVegetablePrice(vegetable, newVagetablePriceObj, cb)
            }
        });
    }

    function prepareData(apiUrl, cb) {
        async.parallel([
            function (cb) {
                getDateByUrl(apiUrl, cb);
            },
            function (cb) {
                getVegetables(cb)
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
        var vegetableFound = false;
        async.each(vegetables, function (vegetable, cb) {
            if (vegetable.jewishNames.indexOf(newVegetablePrice.jewishName) !== -1) {
                saveVegetablePrice(vegetable, newVegetablePrice, cb);
                vegetableFound = true;
            } else {
                cb();
            }
        }, function (err, res) {
            if (err) {
                cb(err);
            } else {
                if (!vegetableFound) {
                    newVegetablePrice.isNewVeg = true;
                    createNewVegetable(newVegetablePrice, cb);
                } else {
                    cb();
                }
            }
        });
    }

    function checkIfPricesSynced(source, cb) {
        var date = new Date();

        Price
            .findOne({
                year: moment(date).year(),
                dayOfYear: moment(date).dayOfYear(),
                source: source
            })
            .exec(function (err, price) {
                if (err) {
                    cb(err);
                } else {
                    if (price) {
                        cb(null, true);
                    } else {
                        cb(null, false);
                    }
                }
            });
    }

    function isTodayDate(dateString) {

        var date = getTransformedDateOject(dateString);
        var todayDate = new Date();

        return (moment(date).format('YYYY/MM/DD') === moment(todayDate).format('YYYY/MM/DD'));
    }

    this.syncVegetablePrices = function (apiUrl, source, cb) {
        checkIfPricesSynced(source, function (err, isSynced) {
            if (err) {
                cb(err);
            } else {
                if (isSynced) {
                    cb();
                } else {
                    prepareData(apiUrl, function (err, resultObj) {
                        if (err) {
                            cb(err);
                        } else {
                            if (isTodayDate(resultObj.newVegetablesPrice.results.priceDate[0].date)) {
                                async.each(resultObj.newVegetablesPrice.results.prices, function (newVegetablePrice, cb) {
                                    newVegetablePrice.date = resultObj.newVegetablesPrice.results.priceDate[0].date;
                                    findVegetableAndSavePrice(resultObj.vegetables, newVegetablePrice, cb);
                                }, cb);
                            } else {
                                cb();
                            }
                        }
                    })
                }
            }
        });
    }
};