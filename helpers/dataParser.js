var request = require("request");
var moment = require("moment");
var async = require('async');

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
        async.each(vegetables, function (vegetable, cb) {
            if (vegetable.jewishNames.indexOf(newVegetablePrice.jewishName) !== -1) {
                saveVegetablePrice(vegetable, newVegetablePrice, cb);
            } else {
                cb();
            }
        }, cb);
    }

    function checkIfPricesSynced(cb) {
        var date = new Date();
        Price
            .findOne({
                year: moment(date).year(),
                dayOfYear: moment(date).dayOfYear()
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

    this.syncVegetablePrices = function (apiUrl, cb) {
        checkIfPricesSynced(function(err, isSynced) {
            if (err) {
                cb(err);
            } else {
                if (isSynced) {
                    cb() ;
                } else {
                    prepareData(apiUrl, function (err, resultObj) {
                        if (err) {
                            cb(err);
                        } else {
                            async.each(resultObj.newVegetablesPrice.results.collection1, function (newVegetablePrice, cb) {
                                findVegetableAndSavePrice(resultObj.vegetables, newVegetablePrice, cb);
                            }, cb);
                        }
                    })
                }
            }
        });

    }
};