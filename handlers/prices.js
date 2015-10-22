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
    var dataParser = new DataParser(db);
    var cropList;
    var cropListMerged = [];
    var lastPriceDate;
    var userFavorites;
    var userMarketeer;
    var receivedPrices;
    var resultPriceList;

    function createFnGetUserFavoritesAndMarketeerById(userId) {
        return function (callback) {
            User
                .findById(userId)
                .populate({path: 'marketeer', select: '_id fullName location'})
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
            .sort({'order': 1})
            .lean()
            .exec(function (err, docs) {
                if (err) {
                    cb(err);
                } else {
                    cropListMerged = [];
                    cropListMerged.push(
                        {
                            englishName: docs[0].englishName,
                            displayName: docs[0].displayName,
                            image: docs[0].image,
                            order: docs[0].order
                        }
                    );

                    for (var i = 1, len = docs.length - 1; i <= len; i++ ){
                        if (docs[i-1].order !== docs[i].order) {
                            cropListMerged.push(
                                {
                                    englishName: docs[i].englishName,
                                    displayName: docs[i].displayName,
                                    image: docs[i].image,
                                    order: docs[i].order
                                }
                            );
                        }
                    }

                    cropList = docs;
                    cb();
                }
            });
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
            console.log('date:', lastPriceDate);

            Price
                .aggregate([
                    {
                        $match: {
                            date: lastPriceDate
                            //dayOfYear: dayOfYear
                        }
                    }, {
                        $group: {
                            _id: '$cropListName',
                            prices: {
                                $push: {
                                    'price': '$price',
                                    'site': '$site',
                                    'cropListName': '$cropListName',
                                    'date': '$date',
                                    'pcQuality': '$pcQuality',
                                    'wsQuality': '$wsQuality'
                                }
                            }
                        }
                    }])
                .exec(function (err, results) {
                    if (err) {
                        cb(err);
                    } else {
                        receivedPrices = results;
                        console.log ('receivedPrices',receivedPrices);
                        cb();
                    }
                });
        };
    }

    function syncPricesAndCropList(cb) {
        var cropsLen = cropListMerged.length - 1;
        var pricedLen = receivedPrices.length - 1;
        var isInFavorites = false;
        var wholesalePrices = {};
        var plantsCouncilPrices = {};
        var marketeerPrices = [];
        var prices = [];
        var maxPrice = -1;
        var maxQuality = '';
        var more = [];

        console.log('cropsLen: ', cropsLen);
        console.log('pricedLen: ', pricedLen);

        resultPriceList = [];

        for (var i = 0; i <= cropsLen; i++) {
            for (var j = pricedLen; j >= 0; j--) {

                if (cropListMerged[i].displayName === receivedPrices[j]._id) {

                    wholesalePrices = {};
                    plantsCouncilPrices = {};
                    marketeerPrices = {};
                    prices = [];

                    isInFavorites = false;
                    receivedPriceArray = receivedPrices[j].prices;


                    if (userFavorites.indexOf(cropListMerged[i].displayName) >= 0 ) {
                        isInFavorites = true;
                    }

                    // TODO calculate Marketeer Price
                    more = [];
                    maxPrice = -1;

                    marketeerPrices = {
                        source: {
                            type: "marketeer",
                            name: userMarketeer.fullName
                        },
                        price: 0,
                        quality: '',
                        data: lastPriceDate,
                        more: more
                    };

                    // TODO calculate plantsCouncil Price
                    more = [];
                    maxPrice = -1;

                    for (var k = receivedPriceArray.length - 1; k >= 0; k--) {
                        if (receivedPriceArray[k].site == "PlantCouncil") {

                            if (maxPrice < receivedPriceArray[k].price) {
                                maxPrice = receivedPriceArray[k].price;
                                maxQuality =  receivedPriceArray[k].pcQuality
                            }

                            more.push(
                                {
                                    price: receivedPriceArray[k].price,
                                    quality: receivedPriceArray[k].pcQuality
                                })
                        }
                    }

                    // sort more max -> to -> min
                    //http://jsperf.com/array-sort-vs-lodash-sort/2
                    more.sort(function compare(a, b) {
                        if (a.price < b.price) return 1;
                        if (a.price > b.price) return -1;
                        return 0;
                    });

                    plantsCouncilPrices = {
                        source: {
                            type: "PlantCouncil",
                            name: "מועצת הצמחים"
                        },
                        price: maxPrice,
                        quality: maxQuality,
                        data: lastPriceDate,
                        more: more
                    };

                    // TODO calculate Wholesale Price
                    more = [];
                    maxPrice = -1;

                    wholesalePrices = {
                        source: {
                            type: "Wholesale",
                            name: "שוק סיטונאי"
                        },
                        price: 0,
                        quality: '',
                        data: lastPriceDate,
                        more: more
                    };

                    prices.push(marketeerPrices);
                    prices.push(wholesalePrices);
                    prices.push(plantsCouncilPrices);

                    resultPriceList.push({
                        //_crop: cropListMerged[i]._id,
                        englishName: cropListMerged[i].englishName,
                        displayName: cropListMerged[i].displayName,
                        isInFavorites: isInFavorites,
                        image: cropListMerged[i].image,
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
            //return res.status(200).send(receivedPrices);

        });
    }

    // TODO Test parse date from wholesale
    this.getWholeSalePrice = function (req, res, next) {
        var tasks = [];

        tasks.push({
            url: constants.URL_APIS.MOAG_URL.SOURCE_1,
            results: []
        });

        tasks.push({
            url: constants.URL_APIS.MOAG_URL.SOURCE_2,
            results: []
        });

        tasks.push({
            url: constants.URL_APIS.MOAG_URL.SOURCE_3,
            //url: 'http://www.prices.moag.gov.il/prices/citrrr_1.htm',
            results: []
        });

        async.map(tasks, dataParser.getBodyByUrl, function (err, result) {
            if (err) {
                return res.status(500).send({error: err});
            }
            return res.send(result);
        });





        //dataParser.getBodyByUrl(constants.URL_APIS.MOAG_URL.SOURCE_2, [], function (err, result) {
        //    if (err) {
        //        return res.status(500).send({error: err});
        //
        //    }
        //    return res.send(result);
        //});
    };

    this.getPlantCouncilPrice = function (req, res, next) {
        var tasks = [];

        tasks.push({
            url: constants.URL_APIS.PLANTS_URL.SOURCE,
            //url: 'http://www.prices.moag.gov.il/prices/citrrr_1.htm',
            results: []
        });

        async.map(tasks, dataParser.getPlantCouncilPrice, function (err, result) {
            if (err) {
                return res.status(500).send({error: err});
            }
            return res.send(result);
        });
    };
};

module.exports = Price;