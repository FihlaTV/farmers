/**
 * Created by eriy on 29.04.2015.
 */
var request = require("request");

var async = require('async');
var DATA_URL = "https://www.kimonolabs.com/api/4fv5re1i?apikey=bG2G9Y4cVggvVGxEV3gSVEyatTIjbHP4";
var lastSyncDate = new Date('12/08/15');

module.exports = function ( db ) {
    var Vegetable = db.model('Vegetable');
    var Price = db.model('Price');

    function getDateByUrl(url, cb) {
        request(url, function(err, response, body) {
            cb(err, JSON.parse(body));
        });
    }

    function getVegetables(cb) {
        Vegetable
            .find()
            .exec(cb)
    }

    function saveVegetablePrice(vagetable, newVagetablePriceObj, cb) {
        var maxPrice = parseFloat(newVagetablePriceObj.max);
        var minPrice = parseFloat(newVagetablePriceObj.min);
        var avgPrice = (minPrice + maxPrice) / 2;

        var saveOptions = {
            avgPrice: avgPrice,
            minPrice: minPrice,
            maxPrice: maxPrice,
            _vegetable: vagetable._id,
            date: newVagetablePriceObj.date
        };

        var price  = new Price(saveOptions);

        price
            .save()
            .exec(cb)
    }

    function prepareData(cb) {
        async.parallel([
            function(cb) {
                getDateByUrl(DATA_URL, cb);
            },
            function(cb) {
                getVegetables(cb)
            }
        ], function(err, results) {
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

    function findVegetableAndSavePrice(vegetables, newvegetablePrice, cb) {
        async.each(vegetables, function(vegetable, cb) {
            if (vegetable.jewishNames.indexOf(newvegetablePrice.jewishName) !== -1) {
                saveVegetablePrice(vegetable, newvegetablePrice, cb);
            } else {
                cb();
            }
        }, cb);
    }

    this.syncVegetablePrices = function(cb) {
        var currentDate = new Date();

        if (true /*currentDate > lastSyncDate*/) {
            lastSyncDate = currentDate;
            prepareData(function(err, resultObj) {
                if (err) {
                    console.log(err);
                } else {
                    async.each(resultObj.newVegetablesPrice.results.collection1, function(newVegetablePrice, cb) {
                        findVegetableAndSavePrice(resultObj.vegetables, newVegetablePrice, cb);
                    }, cb);
                }
            })
        } else {
            cb();
        }
    }
}