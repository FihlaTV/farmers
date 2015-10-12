var mongoose = require('mongoose');
var CONST = require('../constants/constants');
var RESPONSE = require('../constants/response');
var DataParser = require('../helpers/dataParser');
var SessionHandler = require('./sessions');
var moment = require("moment");
var constants = require("../constants/constants");
var async = require('async');

var Price = function (db) {
    var Price = db.model(CONST.MODELS.PRICE);
    var Crop = db.model(CONST.MODELS.CROP);
    var User = db.model(CONST.MODELS.USER);
    var session = new SessionHandler(db);
    var cropList;
    var lastPriceDate;
    var userFavorites;
    var userMarketeer;
    var receivedPrices;
    var resultPriceList;

    function createFnGetUserFavoritesAndMarketeerById(userId) {
        return function (callback) {
            User
                .findById(userId)
                .exec(function (err, model) {
                    if (err) {
                        console.log('error: ', userId);
                        return callback(err);
                    }
                    console.log('model: ', model);
                    if (model) {
                        userFavorites = model.favorites;
                        userMarketeer = model.marketeer;
                        return callback();
                    } else {
                        return callback(RESPONSE.ON_ACTION.NOT_FOUND + ' user with such _id ');
                    }
                });
        };
    }

    function getCropList(cb) {
        Crop
            .find({})
            .lean()
            .exec(function (err, docs) {
                if (err) {
                    cb(err);
                } else {
                    cropList = docs;
                    cb();
                }
            });
    }

    function getJewishDate(date) {
        return
    }

    function getLastPriceDate(cb) {
        Price
            .findOne({})
            .sort({"date": -1})
            //.limit(1)
            .lean()
            .exec(function (err, doc) {
                if (err) {
                    cb(err);
                } else {
                    lastPriceDate = doc.date;
                    // cb(null, lastPriceDate);
                    cb();
                }
            });
    }

    function createFnGetPricesByDate(date) {
        return function (cb) {
            console.log('date:', date);

            Price
                .aggregate([
                    {
                        $match: {
                            date: lastPriceDate
                            //dayOfYear: dayOfYear
                        }
                    }, {
                        $group: {
                            _id: '$_crop',
                            prices: {
                                $push: {
                                    minPrice: '$minPrice',
                                    maxPrice: '$maxPrice',
                                    avgPrice: '$avgPrice',
                                    site: '$site',
                                    name: '$name',
                                    date: '$date'
                                }
                            }
                        }
                    }])
                .exec(function (err, results) {
                    if (err) {
                        cb(err);
                    } else {
                        receivedPrices = results;
                        //console.log ('receivedPrices',receivedPrices);
                        cb();
                    }
                });
        };
    }

    function syncPricesAndCropList (cb) {
        var cropsLen = cropList.length - 1;
        var pricedLen = receivedPrices.length -1;
        var isInFavorites = false;
        var wholesalePrices = {};
        var plantsCouncilPrices = {};
        var marketeerPrices = [];
        var prices = [];
        var maxPrice = -1;
        var more = [];

        console.log('cropsLen: ',cropsLen);
        console.log('pricedLen: ',pricedLen);

        resultPriceList = [];

        for (var i = 0; i <= cropsLen; i++) {
            for (var j = pricedLen; j >= 0; j--) {

                if ("" + cropList[i]._id == "" + receivedPrices[j]._id) {

                    wholesalePrices = {};
                    plantsCouncilPrices = {};
                    marketeerPrices = {};
                    prices = [];

                    isInFavorites = false;
                    receivedPriceArray = receivedPrices[j].prices;


                    if (userFavorites.indexOf(cropList[i]._id) >= 0 ) {
                        isInFavorites = true;
                    }

                    // TODO calculate Marketeer Price
                    more = [];
                    maxPrice = -1;

                    marketeerPrices = {
                        source: {
                            type: "marketeer",
                            name: userMarketeer
                        },
                        value: 0,
                        data: lastPriceDate,
                        more: more
                    };

                    // TODO calculate plantsCouncil Price
                    more = [];
                    maxPrice = -1;

                    for (var k = receivedPriceArray.length - 1; k >= 0; k--) {
                        if (receivedPriceArray[k].site == "PlantCouncil") {
                            maxPrice = maxPrice < receivedPriceArray[k].minPrice ?  receivedPriceArray[k].minPrice : maxPrice;
                            maxPrice = maxPrice < receivedPriceArray[k].maxPrice ?  receivedPriceArray[k].maxPrice : maxPrice;
                            more.push(receivedPriceArray[k])
                        }
                    }

                    plantsCouncilPrices = {
                        source: {
                            type: "site",
                            name: "PlantCouncil"
                        },
                        value: maxPrice,
                        data: lastPriceDate,
                        more: more
                    };

                    // TODO calculate Wholesale Price
                    more = [];
                    maxPrice = -1;

                    wholesalePrices = {
                        source: {
                            type: "site",
                            name: "Wholesale"
                        },
                        value: 0,
                        data: lastPriceDate,
                        more: more
                    };

                    prices.push(marketeerPrices);
                    prices.push(wholesalePrices);
                    prices.push(plantsCouncilPrices);

                    resultPriceList.push({
                        _crop: cropList[i]._id,
                        englishName: cropList[i].englishName,
                        displayName: cropList[i].displayName,
                        isInFavorites: isInFavorites,
                        image: cropList[i].image,
                        prices: prices
                    });

                    j = -1;
                }
            }
        }
        cb()

    }

    this.getLast = function (req, res, next) {
        var tasks = [];
        var userId = req.session.uId;

        tasks.push(getCropList);
        tasks.push(createFnGetUserFavoritesAndMarketeerById(userId));
        tasks.push(getLastPriceDate);
        tasks.push(createFnGetPricesByDate(lastPriceDate));
        tasks.push(syncPricesAndCropList);

        async.series(tasks, function (err, results) {
            if (err) {
                return res.status(500).send({error: err});
            }

            //return res.status(200).send({success: receivedPrices});
            console.log('resultPriceList Len: ', resultPriceList.length);
            return res.status(200).send(resultPriceList);

        });
    }
};

module.exports = Price;