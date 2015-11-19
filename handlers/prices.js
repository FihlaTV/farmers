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
        var Marketeer = db.model(CONST.MODELS.MARKETEER);
        var session = new SessionHandler(db);
        var dataParser = new DataParser(db);
        var cropList;
        var UserId;
        var cropListMerged = [];
        var marketeerList = [];
        var lastPriceDate;
        var userFavorites;
        var userMarketeer;
        var receivedPrices = [];
        var resultPriceList = [];

        function getUserFavoritesAndMarketeerById(callback) {
            User
                .findById(UserId)
                .populate({path: 'marketeer', select: '_id fullName location'})
                .exec(function (err, model) {
                    if (err) {
                        console.log('error: ', UserId);
                        return callback(err);
                    }
                    //console.log('model: ', model);
                    if (model) {
                        userFavorites = model.favorites;
                        userMarketeer = model.marketeer;
                        return callback();
                    } else {
                        return callback(RESPONSE.ON_ACTION.NOT_FOUND + ' user with such _id ');
                    }
                });
        }

        function getCropList(cb) {
            Crop
                .find({})
                .sort({'displayName': 1})
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

                        for (var i = 1, len = docs.length - 1; i <= len; i++) {
                            if (docs[i - 1].order !== docs[i].order) {
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

                        ///  Used only cropListMerged!
                        cropList = docs;
                        cb();
                    }
                });
        }

        function getMarketeerList(cb) {
            Marketeer
                .find()
                .lean()
                .exec(function (err, docs) {
                    if (err) {
                        cb(err);
                    } else {

                        // Create Case Array
                        //{
                        //    "5628dc12bee373d81a1d31a5": {
                        //    "_id": "5628dc12bee373d81a1d31a5",
                        //        "fullName": "שפיט (1991)",
                        //        "location": "שוק רחובות",
                        //        "updatedAt": "2015-10-22T12:52:34.148Z",
                        //        "createdAt": "2015-10-22T12:52:34.148Z",
                        //        "mergeNames": [],
                        //        "__v": 0
                        //},

                        marketeerList = {};

                        for (var i = docs.length - 1; i >= 0; i--) {
                            marketeerList[(docs[i]._id).toString()] = docs[i]
                        }
                        //marketeerList = docs;
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

        function GeCropsAndLastDate(cb) {
            var startTime = new Date();
            var agregation = Price
                .aggregate(
                [
                    {
                        $match: {
                            $or: [{site: {$exists: true}}, {"_user": UserId}]
                        }
                    },

                    {
                        $sort: {
                            cropListName: 1,
                            date: -1
                        }
                    },

                    {
                        $group: {
                            '_id': '$cropListName',
                            'date': {$max: "$date"}
                        }
                    },
                    {
                        "$project": {
                            "cropListName": "$_id",
                            'date': '$date',
                            _id: false
                        }
                    },
                ]
            );
            agregation.options = {allowDiskUse: true};

                // with sort time=600? without sort used  time=400
                // with price pus and sort time=1725  without sort used  time=1460
            agregation.exec(function (err, results) {
                    if (err) {
                        cb(err);
                    } else {

                        console.log('Spend time for GeCropsAndLastDate: ', (new Date() - startTime) /1000);

                        receivedPrices = results;
                            return cb();

                    }
                });
        }

        function GetPricesByLastDate(cb) {
            var startTime = new Date();
            var lastTime;
            var tempArray = [];
            var agregation = Price
                .aggregate(
                [
                    {
                        $match: {
                            $or: [{site: {$exists: true}}, {"_user": UserId}]
                        }
                    },
                    //
                    //{
                    //    $match: {
                    //
                    //        $and:[
                    //            {
                    //                $or: receivedPrices
                    //            },
                    //
                    //{$or: [{site: {$exists: true}}, {"_user": UserId}]}
                    //        ]
                    //
                    //    }
                    //},
                    //{
                    //    $sort: {
                    //        cropListName: 1,
                    //        date: -1
                    //    }
                    //},

                    {
                        $group: {
                            '_id': '$cropListName',
                            'lastDate': {$max: "$date"},

                            prices: {
                                $push: {
                                    'price': '$price',
                                    'site': '$site',
                                    'cropListName': '$cropListName',
                                    'date': '$date',
                                    'pcQuality': '$pcQuality',
                                    'wsQuality': '$wsQuality',
                                    'userQuality': '$userQuality',
                                    '_marketeer': '$_marketeer',
                                    '_user': '$_user',
                                    'imported': '$imported'
                                }
                            }
                        }
                    },

                    { $unwind: '$prices'},
                    {
                        $group: {
                            '_id': { cropListName:'$_id',
                            'lastDate': "$lastDate"},

                            prices: {
                                $push: {  $cond : [ { $eq : ['$prices.date', '$lastDate' ]}, {
                                    'price': '$prices.price',
                                    'site': '$prices.site',
                                    'cropListName': '$prices.cropListName',
                                    'date': '$prices.date',
                                    'pcQuality': '$prices.pcQuality',
                                    'wsQuality': '$prices.wsQuality',
                                    'userQuality': '$prices.userQuality',
                                    '_marketeer': '$prices._marketeer',
                                    '_user': '$prices._user',
                                    'imported': '$prices.imported'
                                }, null]}
                            }
                        }
                    },
                    {
                        $sort: {
                            '_id.lastDate': -1,
                            '_id.cropListName': 1
                        }
                    },

                    {
                        "$project": {
                            'lastDate': '$_id.lastDate',
                            _id: '$_id.cropListName',
                            prices: '$prices'
                        }

                    },

                    //{
                    //    $out : "randomAggregates"
                    //}


                ]
            ).allowDiskUse(true)
            //agregation.options = {allowDiskUse: true};


                .exec(function (err, results) {
                if (err) {
                    return cb(err);
                }


                    lastTime =  (new Date() - startTime) /1000;
                    console.log('Spend time for GetPricesByLastDate: ', lastTime);

                    //Filter empty
                    for (var i = 0, len = results.length - 1; i <= len; i++){
                        tempArray = [];
                        for (var j =  results[i].prices.length - 1; j >= 0; j--){
                            if (results[i].prices[j]) {
                                tempArray.push(results[i].prices[j]);
                            }
                        }
                        results[i].prices = tempArray;
                    }


                    receivedPrices = results;

                    console.log('Spend time for Filter empty elements: ', (new Date() - startTime - lastTime * 1000) /1000);


                    //TODO when optimize agregation > dell this

                    // get no lastDate information


                    //receivedPrices = results;
                    console.log('Main screen unique Crop: ', receivedPrices.length);
                    //console.log('Spend time: ', new Date - startTime);
                    cb();

            });
        }

        function syncPricesAndCropList(cb) {
            var cropsLen = cropListMerged.length;
            var pricedLen = receivedPrices.length;
            var isInFavorites;
            var wholesalePrices;
            var plantsCouncilPrices;
            var marketeerPrices;
            var findIndex;
            var prices;
            var maxPrice = -1;
            var maxQuality = '';
            var more = [];
            var tempName = '';

            console.log('cropsLen: ', cropsLen);
            console.log('pricedLen: ', pricedLen);

            resultPriceList = [];

            for (var j = 0; j <= pricedLen - 1; j++) {
                if (receivedPrices[j]._id) {
                    receivedPriceArray = receivedPrices[j].prices;

                    //console.log('receivedPrices: ', receivedPrices[j]._id);
                    //console.dir(receivedPrices[j].prices);

                    wholesalePrices = {};
                    plantsCouncilPrices = {};
                    marketeerPrices = {};
                    prices = [];

                    // TODO calculate Marketeer Price
                    more = [];
                    maxPrice = -1;
                    maxQuality = '';

                    for (var k = receivedPriceArray.length - 1; k >= 0; k--) {
                        if (receivedPriceArray[k]._marketeer) {
                            tempName = marketeerList[(receivedPriceArray[k]._marketeer).toString()].fullName;
                            more.push(
                                {
                                    price: receivedPriceArray[k].price,
                                    quality: receivedPriceArray[k].userQuality
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

                    maxPrice = more.length ? more[0].price : 0;
                    maxQuality = more.length ? more[0].quality : '';

                    tempName = tempName ? tempName : (userMarketeer ? userMarketeer.fullName : '');

                    marketeerPrices = {
                        source: {
                            type: "marketeer",
                            name: tempName
                        },
                        price: maxPrice,
                        quality: maxQuality,
                        data: receivedPrices[j].lastDate,
                        more: more
                    };

                    // TODO calculate plantsCouncil Price
                    more = [];
                    maxPrice = -1;
                    maxQuality = '';

                    for (var k = receivedPriceArray.length - 1; k >= 0; k--) {
                        if (receivedPriceArray[k].site == "PlantCouncil") {

                            if (maxPrice < receivedPriceArray[k].price) {
                                maxPrice = receivedPriceArray[k].price;
                                maxQuality = receivedPriceArray[k].pcQuality
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
                        price: maxPrice > 0 ? maxPrice : 0,
                        quality: maxQuality,
                        data: receivedPrices[j].lastDate,
                        more: more
                    };

                    // TODO calculate Wholesale Price
                    more = [];
                    maxPrice = -1;
                    maxQuality = '';

                    for (var k = receivedPriceArray.length - 1; k >= 0; k--) {
                        if (receivedPriceArray[k].site == "Wholesale") {
                            more.push(
                                {
                                    price: receivedPriceArray[k].price,
                                    quality: receivedPriceArray[k].wsQuality,
                                    imported: receivedPriceArray[k].imported
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

                    maxPrice = more.length ? more[more.length - 1].price : '';
                    maxQuality = more.length ? more[more.length - 1].quality : '';

                    for (var k = more.length - 1; k >= 0; k--) {
                        if (!more[k].imported) {
                            if (maxPrice < more[k].price) {
                                maxPrice = more[k].price;
                                maxQuality = more[k].quality
                            }
                        }
                        delete(more[k].imported);
                    }

                    wholesalePrices = {
                        source: {
                            type: "Wholesale",
                            name: "שוק סיטונאי"
                        },
                        price: maxPrice > 0 ? maxPrice : 0,
                        quality: maxQuality,
                        data: receivedPrices[j].lastDate,
                        more: more
                    };


                    prices.push(marketeerPrices);
                    prices.push(wholesalePrices);
                    prices.push(plantsCouncilPrices);

                    //Sync with cropList
                    findIndex = -1;
                    for (var i = cropsLen - 1; i >= 0; i--) {
                        if (cropListMerged[i].displayName === receivedPrices[j]._id) {
                            findIndex = i;
                            i = -1;
                        }
                    }

                    isInFavorites = userFavorites.indexOf(receivedPrices[j]._id) >= 0;

                    if (findIndex >= 0) {

                        resultPriceList.push({
                            _crop: cropListMerged[findIndex]._id,
                            englishName: cropListMerged[findIndex].englishName,
                            displayName: cropListMerged[findIndex].displayName,
                            isInFavorites: isInFavorites,
                            image: cropListMerged[findIndex].image,
                            prices: prices
                        });
                    }
                }
            }
            cb()
        };

        function mergeCropPricesByDate(cb) {
            var cropsLen = cropListMerged.length - 1;
            var pricedLen = receivedPrices.length - 1;
            var wholesalePrices = {};
            var plantsCouncilPrices = {};
            var marketeerPrices = [];
            var prices = [];
            var maxPrice = -1;
            var maxQuality = '';
            var more = [];
            var tempName = '';

            console.log('cropsLen: ', cropsLen);
            console.log('pricedLen: ', pricedLen);

            resultPriceList = [];
            for (var j = 0; j <= pricedLen; j++) {
                receivedPriceArray = receivedPrices[j].prices;

                console.log('receivedPrices: ', receivedPrices[j]._id);
                console.dir(receivedPrices[j].prices);

                wholesalePrices = {};
                plantsCouncilPrices = {};
                marketeerPrices = {};
                prices = [];

                // TODO calculate Marketeer Price
                more = [];
                maxPrice = -1;
                maxQuality = '';

                for (var k = receivedPriceArray.length - 1; k >= 0; k--) {
                    if (receivedPriceArray[k]._marketeer) {
                        tempName = marketeerList[(receivedPriceArray[k]._marketeer).toString()].fullName;
                        more.push(
                            {
                                price: receivedPriceArray[k].price,
                                quality: receivedPriceArray[k].userQuality
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

                maxPrice = more.length ? more[0].price : 0;
                maxQuality = more.length ? more[0].quality : '';

                tempName = tempName ? tempName : (userMarketeer ? userMarketeer.fullName : '');

                marketeerPrices = {
                    source: {
                        type: "marketeer",
                        name: tempName
                    },
                    price: maxPrice,
                    quality: maxQuality,
                    data: receivedPrices[j]._id,
                    more: more
                };

                // TODO calculate plantsCouncil Price
                more = [];
                maxPrice = -1;
                maxQuality = '';

                for (var k = receivedPriceArray.length - 1; k >= 0; k--) {
                    if (receivedPriceArray[k].site == "PlantCouncil") {

                        if (maxPrice < receivedPriceArray[k].price) {
                            maxPrice = receivedPriceArray[k].price;
                            maxQuality = receivedPriceArray[k].pcQuality
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
                    price: maxPrice > 0 ? maxPrice : 0,
                    quality: maxQuality,
                    data: receivedPrices[j]._id,
                    more: more
                };

                // TODO calculate Wholesale Price
                more = [];
                maxPrice = -1;
                maxQuality = '';

                for (var k = receivedPriceArray.length - 1; k >= 0; k--) {
                    if (receivedPriceArray[k].site == "Wholesale") {
                        more.push(
                            {
                                price: receivedPriceArray[k].price,
                                quality: receivedPriceArray[k].wsQuality,
                                imported: receivedPriceArray[k].imported
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

                maxPrice = more.length ? more[more.length - 1].price : '';
                maxQuality = more.length ? more[more.length - 1].quality : '';

                for (var k = more.length - 1; k >= 0; k--) {
                    if (!more[k].imported) {
                        if (maxPrice < more[k].price) {
                            maxPrice = more[k].price;
                            maxQuality = more[k].quality
                        }
                    }
                    delete(more[k].imported);
                }

                wholesalePrices = {
                    source: {
                        type: "Wholesale",
                        name: "שוק סיטונאי"
                    },
                    price: maxPrice > 0 ? maxPrice : 0,
                    quality: maxQuality,
                    data: receivedPrices[j]._id,
                    more: more
                };


                prices.push(marketeerPrices);
                prices.push(wholesalePrices);
                prices.push(plantsCouncilPrices);

                resultPriceList.push({
                    //_crop: cropListMerged[i]._id,
                    ////englishName: cropListMerged[i].englishName,
                    ////displayName: cropListMerged[i].displayName,
                    ////isInFavorites: isInFavorites,
                    //image: cropListMerged[i].image,
                    prices: prices
                });
            }
            cb();
        }

        function mergeMarketeerCropPricesByDate(cb) {
            var pricedLen = receivedPrices.length - 1;
            var marketeersPrices = [];
            var prices = [];
            var more = [];
            var usersDailyMarketeer; // _marketteer
            var tempObj;
            var tempArray;
            var tempFlag = false;
            var unSeeAreaStartIndex;


            console.log('pricedLen: ', pricedLen);

            resultPriceList = [];

            for (var j = 0; j <= pricedLen; j++) {
                receivedPriceArray = receivedPrices[j].prices;

                // sort by marketeer max -> to -> min
                //http://jsperf.com/array-sort-vs-lodash-sort/2
                receivedPriceArray.sort(function compare(a, b) {
                    if (a._marketeer < b._marketeer) return 1;
                    if (a._marketeer > b._marketeer) return -1;
                    return 0;
                });

                usersDailyMarketeer = null;  // if usersDailyMarketeer = null user not sell on this day

                marketeersPrices = [];
                for (var i = receivedPriceArray.length - 1; i >= 0; i--) {
                    more = [];
                    //console.log('if: ',(receivedPriceArray[i + 1] && receivedPriceArray[i]._marketeer != receivedPriceArray[i + 1]._marketeer) || (!receivedPriceArray[i + 1]));


                    if ((receivedPriceArray[i + 1] && (receivedPriceArray[i]._marketeer).toString() != (receivedPriceArray[i + 1]._marketeer).toString()) || (!receivedPriceArray[i + 1])) {
                        for (var k = i; k >= 0; k--) {
                            if ((receivedPriceArray[i]._marketeer).toString() === (receivedPriceArray[k]._marketeer).toString() && (receivedPriceArray[k]._user).toString() === UserId.toString()) {
                                usersDailyMarketeer = receivedPriceArray[k]._marketeer;
                                console.log(j, ' ||| usersDailyMarketeer: ', usersDailyMarketeer);
                            }

                            if ((receivedPriceArray[i]._marketeer).toString() === (receivedPriceArray[k]._marketeer).toString()) {
                                more.push(
                                    {
                                        price: receivedPriceArray[k].price,
                                        quality: receivedPriceArray[k].userQuality
                                    });
                            }

                        }

                        // sort more max -> to -> min
                        //http://jsperf.com/array-sort-vs-lodash-sort/2

                        more.sort(function compare(a, b) {
                            if (a.price < b.price) return 1;
                            if (a.price > b.price) return -1;
                            return 0;
                        });


                        // Merge same quality
                        tempArray = [];
                        tempArray.push(more[0]);

                        for (var k = 1, len = more.length - 1; k <= len; k++) {

                            tempFlag = false;

                            for (var h = tempArray.length - 1; h >= 0; h--) {
                                tempFlag = !tempFlag ? (more[k].quality === tempArray[h].quality) : true;
                            }

                            if (!tempFlag) {
                                tempArray.push(more[k])
                            }
                        }
                        more = tempArray;


                        marketeersPrices.push({
                            name: marketeerList[(receivedPriceArray[i]._marketeer).toString()].fullName,
                            location: marketeerList[(receivedPriceArray[i]._marketeer).toString()].location,
                            price: more[0].price,
                            data: receivedPrices[j]._id,
                            quality: more[0].quality,
                            more: more
                        });
                    }

                }

                marketeersPrices.sort(function compare(a, b) {
                    if (a.price < b.price) return 1;
                    if (a.price > b.price) return -1;
                    return 0;
                });

                //TODO userMarketeer move to top if is or add
                //TODO check if marketeer exist in list

                tempObj = null;

                if (userMarketeer) {

                    for (var m = marketeersPrices.length - 1; m >= 0; m--) {
                        if (marketeersPrices[m].name === userMarketeer.fullName) {
                            tempObj = marketeersPrices.splice(m, 1);
                        }
                    }

                    if (tempObj) {
                        marketeersPrices.unshift(tempObj[0])
                    } else {
                        marketeersPrices.unshift({
                            name: marketeerList[(userMarketeer._id).toString()].fullName,
                            location: marketeerList[(userMarketeer._id).toString()].location,
                            price: null,
                            data: receivedPrices[j]._id,
                            quality: '',
                            more: []
                        })
                    }
                }

                console.log(j, ' ---- usersDailyMarketeer: ', usersDailyMarketeer);

                if (!usersDailyMarketeer) {
                    unSeeAreaStartIndex = marketeersPrices.length - Math.floor(marketeersPrices.length * 1.4 / 3);
                    console.log(' ------------marketeersPrices.length: ', marketeersPrices.length, ' unSeeAreaStartIndex: ', unSeeAreaStartIndex, '---------------');

                    for (var k = 0, len = unSeeAreaStartIndex - 1; k <= len; k++) {
                        marketeersPrices[k].price = null;
                        marketeersPrices[k].more = [];
                    }

                }

                resultPriceList.push({
                    data: receivedPrices[j]._id,
                    prices: marketeersPrices
                });

                //console.log('receivedPrices: ', receivedPrices[j]._id);
                //console.dir(receivedPrices[j].prices);

            }
            cb();
        }

        function getLastPricesOfFavorites(cb) {

            console.log('date:', lastPriceDate);

            Price
                .aggregate([
                    {
                        $match: {
                            "cropListName": {$in: userFavorites}
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
                    },
                    // -1 menas first newest date in upper
                    //TODO check sort function, dont work
                    {$sort: {"prices.date": 1}}
                ])
                .exec(function (err, results) {
                    if (err) {
                        cb(err);
                    } else {
                        receivedPrices = results;
                        console.log('receivedPrices: ', receivedPrices);
                        cb(err, results);
                    }
                });
        }

        function createFnGetPricesForCropByPeriod(cropName, startDate, endDate) {
            return function (cb) {

                Price
                    .aggregate([
                        {
                            $match: {
                                $and: [
                                    {cropListName: cropName, date: {$gte: endDate, $lt: startDate}},
                                    {$or: [{site: {$exists: true}}, {"_user": UserId}]}
                                ]
                                //date: {$gte: startDate ISODate("2013-01-01T00:00:00.0Z"), $lt: ISODate("2013-02-01T00:00:00.0Z")}
                                //dayOfYear: dayOfYear
                            }
                        }, {
                            $group: {
                                _id: '$date',
                                prices: {
                                    $push: {
                                        'price': '$price',
                                        'site': '$site',
                                        '_user': '$_user',
                                        '_marketeer': '$_marketeer',
                                        'cropListName': '$cropListName',
                                        'date': '$date',
                                        'pcQuality': '$pcQuality',
                                        'wsQuality': '$wsQuality',
                                        'userQuality': '$userQuality',
                                        'imported': '$imported'
                                    }
                                }
                            }
                        },
                        {
                            $sort: {_id: -1}
                        }
                    ])
                    .exec(function (err, results) {
                        if (err) {
                            cb(err);
                        } else {
                            receivedPrices = results;
                            console.log('receivedPrices: ', receivedPrices);
                            //console.log('receivedPrices[0]: ', receivedPrices[0].prices);
                            cb(err, results);
                        }
                    });
            }
        }

        function createFnGetMarketeerPricesForCropByPeriod(cropName, startDate, endDate) {
            return function (cb) {

                Price
                    .aggregate([
                        {
                            $match: {
                                $and: [
                                    {cropListName: cropName, date: {$gte: endDate, $lt: startDate}},
                                    {site: {$exists: false}}
                                ]
                            }
                        }, {
                            $group: {
                                _id: '$date',
                                prices: {
                                    $push: {
                                        'price': '$price',
                                        //'site': '$site',
                                        '_user': '$_user',
                                        '_marketeer': '$_marketeer',
                                        //'cropListName': '$cropListName',
                                        //'date': '$date',
                                        'pcQuality': '$pcQuality',
                                        'wsQuality': '$wsQuality',
                                        'userQuality': '$userQuality',
                                        //'imported': '$imported'
                                    }
                                }
                            }
                        },
                        {
                            $sort: {_id: -1}
                        }
                    ])
                    .exec(function (err, results) {
                        if (err) {
                            cb(err);
                        } else {
                            receivedPrices = results;
                            //console.log('receivedPrices: ', receivedPrices);
                            //console.log('receivedPrices[0]: ', receivedPrices[0].prices);
                            cb(err, results);
                        }
                    });
            }
        }

        function createFnCheckOtherUsersMarketeerPriceOnDate(options) {
            return function (cb) {

                if (!userMarketeer) {
                    return cb(RESPONSE.NOT_MARKETEER);
                }

                console.log(options);

                Price
                    .find(
                    {
                        $and: [options,
                            {
                                _marketeer: {
                                    $ne: userMarketeer._id
                                }
                            }
                        ]
                    }
                )
                    .lean()
                    .exec(function (err, results) {

                        if (err) {
                            return cb('DB err:' + err);
                        }

                        //console.log(results);
                        //console.log('userMarketeer._id: ', userMarketeer._id);
                        //console.log(results._marketeer == userMarketeer._id);

                        if (results.length) {
                            return cb(RESPONSE.NOT_ALLOW_ADD_PRICE_OTHER_MARKETEER);
                        }
                        cb()
                    }
                )
            }
        }

        function createFnCheckCountOfUsersPriceOnDate(options) {
            return function (cb) {

                if (!userMarketeer) {
                    return cb(RESPONSE.NOT_MARKETEER);
                }
                Price
                    .count(options, function (err, count) {

                        if (err) {
                            return cb('DB err:' + err);
                        }

                        if (count >= 100) {
                            return cb(RESPONSE.NOT_ALLOW_TOO_MUCH_PRICE_FOR_DAY);
                        }

                        cb()
                    }
                )
            }
        }

        function createFnSaveFarmerPrices(prices) {
            return function (cb) {
                // eachSeries need only in check purpose
                if (!userMarketeer) {
                    return cb('User dont has marketeer');
                }

                async.eachSeries(prices, function (item, callback) {
                    var price = parseFloat(item.price) || 0;
                    var saveOptions;

                    saveOptions = {
                        price: price,
                        date: item.date,
                        userQuality: item.userQuality,
                        _user: UserId,
                        _marketeer: userMarketeer._id,
                        cropListName: item.cropListName,
                        year: moment(item.date).year(),
                        month: moment(item.date).month(),
                        dayOfYear: moment(item.date).dayOfYear()
                    };

                    price = new Price(saveOptions);
                    price
                        .save(function (err, model) {
                            if (err) {
                                return callback('DB err:' + err);
                            }
                            callback();
                        });
                }, function (err) {
                    if (err) {
                        return cb(err);
                    }
                    cb();
                });
            }
        }


        this.getLast = function (req, res, next) {
            var tasks = [];

            UserId = req.session.uId;

            tasks.push(getCropList);
            tasks.push(getMarketeerList);
            tasks.push(getUserFavoritesAndMarketeerById);
            //tasks.push(getLastPriceDate);
            //tasks.push(GeCropsAndLastDate);
            tasks.push(GetPricesByLastDate);
            tasks.push(syncPricesAndCropList);

            async.series(tasks, function (err, results) {
                if (err) {
                    return res.status(500).send({error: err});
                }

                //return res.status(200).send({success: receivedPrices});
                //console.log('resultPriceList Len: ', resultPriceList.length);
                return res.status(200).send(resultPriceList);
                //return res.status(200).send(marketeerList);
                //return res.status(200).send(receivedPrices);

            });
        };

        this.getCropPricesForPeriod = function (req, res, next) {
            var tasks = [];
            var today = new Date();
            var lastWeekDate = (new Date(today)).setDate((today.getDate() - 7));
            var startDate = req.query.startDate || today;
            var endDate = req.query.endDate || new Date(lastWeekDate);
            var cropName = req.query.cropName;

            UserId = req.session.uId;

            console.log('Name: ', cropName, ' startDate: ', startDate, ' ', typeof (startDate), ' endDate: ', "" + endDate, typeof (endDate));

            if (!startDate || !endDate || !cropName || startDate < endDate) {
                return res.status(400).send({error: RESPONSE.NOT_ENOUGH_PARAMS});
            }

            startDate = new Date(startDate);
            endDate = new Date(endDate);

            startDate.setUTCHours(23);
            startDate.setUTCMinutes(55);

            endDate.setUTCHours(0);
            endDate.setUTCMinutes(0);


            //console.log(d.getTimezoneOffset());

            console.log('startDate: ', startDate, 'endDate: ', endDate);

            tasks.push(getCropList);
            tasks.push(getMarketeerList);
            tasks.push(getUserFavoritesAndMarketeerById);
            tasks.push(createFnGetPricesForCropByPeriod(cropName, startDate, endDate));
            tasks.push(mergeCropPricesByDate);

            async.series(tasks, function (err, results) {
                if (err) {
                    return res.status(500).send({error: err});
                }

                //return res.status(200).send({success: receivedPrices});
                console.log('resultPriceList Len: ', receivedPrices.length);
                console.log('resultPriceList Len: ', resultPriceList.length);
                return res.status(200).send(resultPriceList);
                //return res.status(200).send(receivedPrices);

            });
        };

        this.getMarketeerCropPricesForPeriod = function (req, res, next) {
            var tasks = [];
            var today = new Date();
            var lastWeekDate = (new Date(today)).setDate((today.getDate() - 7));
            var startDate = req.query.startDate || today;
            var endDate = req.query.endDate || new Date(lastWeekDate);
            var cropName = req.query.cropName;

            UserId = req.session.uId;

            //console.log('Name: ', cropName, ' startDate: ', startDate, ' ', typeof (startDate), ' endDate: ', "" + endDate, typeof (endDate));

            if (!startDate || !endDate || !cropName || startDate < endDate) {
                return res.status(400).send({error: RESPONSE.NOT_ENOUGH_PARAMS});
            }

            startDate = new Date(startDate);
            endDate = new Date(endDate);

            startDate.setUTCHours(23);
            startDate.setUTCMinutes(55);

            endDate.setUTCHours(0);
            endDate.setUTCMinutes(0);


            console.log('startDate: ', startDate, 'endDate: ', endDate);

            tasks.push(getCropList);
            tasks.push(getMarketeerList);
            tasks.push(getUserFavoritesAndMarketeerById);
            tasks.push(createFnGetMarketeerPricesForCropByPeriod(cropName, startDate, endDate));
            tasks.push(mergeMarketeerCropPricesByDate);

            async.series(tasks, function (err, results) {
                if (err) {
                    return res.status(500).send({error: err});
                }

                //return res.status(200).send({success: receivedPrices});
                //console.log('resultPriceList Len: ', receivedPrices.length);
                //console.log('resultPriceList Len: ', resultPriceList.length);
                return res.status(200).send(resultPriceList);
                //return res.status(200).send(receivedPrices);

            });
        };

        this.getLastFavorites = function (req, res, next) {
            var tasks = [];
            UserId = req.session.uId;

            tasks.push(getCropList);
            tasks.push(getMarketeerList);
            tasks.push(getUserFavoritesAndMarketeerById);
            tasks.push(getLastPricesOfFavorites);
            //tasks.push(getLastPriceDate);
            //tasks.push(createFnGetPricesByDate(lastPriceDate));
            //tasks.push(syncPricesAndCropList);

            async.series(tasks, function (err, results) {
                if (err) {
                    return res.status(500).send({error: err});
                }

                //return res.status(200).send({success: receivedPrices});
                console.log('resultPriceList Len: ', results.length);
                return res.status(200).send(results);
                //return res.status(200).send(receivedPrices);

            });
        };

        this.addFarmerPrices = function (req, res, next) {
            var tasks = [];
            var date = req.body.date;
            var cropName = req.body.cropName;
            var prices = req.body.prices; /// [ {price: , userQuality: }
            var checkOptions;
            var startTime = new Date();


            UserId = req.session.uId;

            if (!date || !cropName || !prices || !prices.length) {
                return res.status(400).send({error: RESPONSE.NOT_ENOUGH_PARAMS});
            }


            //TODO set good date format with correct time and timezone
            date = new Date(date);

            if (date.getDay() === 5 || date.getDay() === 6) {
                return res.status(400).send({error: RESPONSE.NOT_ALLOW_DATE_SELECTED});
            }

            date.setUTCHours(12);
            date.setUTCMinutes(0);
            date.setUTCSeconds(0);
            date.setUTCMilliseconds(0);
            //console.log(date);

            for (var i = prices.length - 1; i >= 0; i--) {
                prices[i].date = date;
                prices[i].cropListName = cropName;
            }

            checkOptions = {
                date: date,
                cropListName: cropName,
                _user: UserId
            };

            //TODO Validate check cropName in cropList for

            tasks.push(getUserFavoritesAndMarketeerById);

            // check if there are other user marketeer prices or more than 100
            tasks.push(createFnCheckOtherUsersMarketeerPriceOnDate(checkOptions));
            tasks.push(createFnCheckCountOfUsersPriceOnDate(checkOptions));
            tasks.push(createFnSaveFarmerPrices(prices));

            async.series(tasks, function (err, results) {
                console.log(startTime);
                if (err) {
                    return res.status(400).send({error: err});
                }
                return res.status(200).send({'success': RESPONSE.ON_ACTION.SUCCESS});
            });
        };

// TODO Test parse date from wholesale
        this.getWholeSalePrice = function (req, res, next) {
            var tasks = [];
            var startTime = new Date();

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
            console.log('start time: ', startTime);

            //async.mapSeries(tasks, dataParser.parseWholesalesByUrl, function (err, result) { // spend time: 10498
            async.map(tasks, dataParser.parseWholesalesByUrl, function (err, result) { // spend time: 4558
                if (err) {
                    return res.status(500).send({error: err});
                }
                console.log('Spend time: ', new Date() - startTime);
                return res.send(result);
            });
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
    }
    ;

module.exports = Price;