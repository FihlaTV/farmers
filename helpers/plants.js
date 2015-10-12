var request = require("request");
var moment = require("moment");
var async = require('async');
var _ = require('lodash');


module.exports = function (db) {
    var Plant = db.model('Plant');
    var Price = db.model('Price');

    function concatPlantsPrices(plants, prices, cb) {
        var index;
        async.map(plants, function (plant, cb) {
            index = _.findIndex(prices, '_id', plant._id);
            plant = plant.toJSON();

            if (index !== -1) {
                plant.prices = prices[index].prices;
            } else {
                plant.prices = [];
            }
            cb(null, plant);
        }, cb);
    }

    function getPlantsPricesByDate(date, cb) {
        var year = moment(date).year();
        var dayOfYear = moment(date).dayOfYear();

        Price
            .aggregate([
                {
                    $match: {
                        year: year,
                        dayOfYear: dayOfYear
                    }
                }, {
                    $group: {
                        _id: '$_plant',
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
            .exec(cb);
    }

    this.getPlantsWithPrices = function (date, cb) {
        async.parallel([
            function (cb) {
                getPlantsPricesByDate(date, cb);
            },
            function (cb) {
                Plant.find({}).exec(cb);
            }
        ], function (err, result) {
            if (err) {
                cb(err);
            } else {
                concatPlantsPrices(result[1], result[0], cb);
            }
        });
    };

    this.getAvgPrice = function (minPrice, maxPrice) {

        if ((minPrice === 0) || (maxPrice === 0)) {
            return ((minPrice === 0) ? maxPrice : minPrice);
        } else {
            return ((minPrice * 100 + maxPrice * 100) / 200);
        }
    };

};