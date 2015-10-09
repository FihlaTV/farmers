var request = require("request");
var moment = require("moment");
var async = require('async');
var PlantsHelper = require('../helpers/plants');
var CONST = require('../constants/constants');
var mailer = require('../helpers/mailer');


module.exports = function (db) {
    var Plant = db.model('Plant');
    var Crop = db.model(CONST.MODELS.CROP);
    var Price = db.model(CONST.MODELS.PRICE);
    var Notification = db.model(CONST.MODELS.NOTIFICATION);

    var ParsedBody = db.model(CONST.MODELS.PARSED_BODY);

    var plantsHelper = new PlantsHelper(db);

    function getDateByUrl(url, cb) {
        request(url, function (err, response, body) {
            var parsedBody = new ParsedBody({body: body});

            parsedBody.save();

            if (!body) {
                return cb(new Error('body is empty (check your connection to internet)'));
            }
            if ((/</.test(body))) {
                console.log('!!!! recieved Body has <DOCTYPE>   !!!!');

            } else {
                cb(err, JSON.parse(body));
            }
        });
    }

    function getPlants(cb) {
        Plant.find({}).exec(cb);
    }

    function getTransformedDateOject(date) {
        date = date.split('/');

        if (date[2].length === 2) {
            date[2] = 20 + date[2];
        }

        return new Date(date[2] + '/' + date[1] + '/' + date[0] + ' 12:12:12 GMT+3');
    }

    function savePlantPrice(plant, newPlantPriceObj, cb) {
        var maxPrice = parseFloat(newPlantPriceObj.maxPrice) || 0;
        var minPrice = parseFloat(newPlantPriceObj.minPrice) || 0;
        var date = getTransformedDateOject(newPlantPriceObj.date);
        var avgPrice = plantsHelper.getAvgPrice(minPrice, maxPrice);
        var saveOptions;

        saveOptions = {
            _plant: plant._id,
            source: newPlantPriceObj.url,
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

    function createNewPlant(newPlantPriceObj, cb) {
        var saveOptions;

        saveOptions = {
            englishName: "No Name",
            jewishNames: [newPlantPriceObj.jewishName]
        };

        if (newPlantPriceObj.isNewPlant) {
            saveOptions.isNewPlant = true;
        }

        Plant.create(saveOptions, function (err, plant) {
            if (err) {
                cb(err);
            } else {
                savePlantPrice(plant, newPlantPriceObj, cb)
            }
        });
    }

    function prepareData(apiUrl, cb) {
        async.parallel([
            function (cb) {
                getDateByUrl(apiUrl, cb);
            },
            function (cb) {
                getPlants(cb)
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
        });
    }

    function findPlantAndSavePrice(plants, newPlantPrice, cb) {
        var plantFound = false;
        async.each(plants, function (plant, cb) {
            if (plant.jewishNames.indexOf(newPlantPrice.jewishName) !== -1) {
                savePlantPrice(plant, newPlantPrice, cb);
                plantFound = true;
            } else {
                cb();
            }
        }, function (err, res) {
            if (err) {
                cb(err);
            } else {
                if (!plantFound) {
                    newPlantPrice.isNewPlant = true;
                    createNewPlant(newPlantPrice, cb);
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

    this.syncPlantPrices = function (apiUrl, source, cb) {
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
                            if (isTodayDate(resultObj.newPlantsPrice.results.priceDate[0].date)) {
                                async.each(resultObj.newPlantsPrice.results.prices, function (newPlantPrice, cb) {
                                    newPlantPrice.date = resultObj.newPlantsPrice.results.priceDate[0].date;
                                    findPlantAndSavePrice(resultObj.plants, newPlantPrice, cb);
                                }, cb);
                            } else {
                                cb();
                            }
                        }
                    });
                }
            }
        });
    };

    function parsePricesFromSite(apiUrl, callback) {
        async.parallel([
            function (cb) {
                getDateByUrl(apiUrl, cb);
            },
            function (cb) {
                getPlants(cb)
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
        });
    }

    this.syncCropPrices = function (apiUrl, cropList, cb) {
        var priceDate;
        var source;

        getDataByUrl(apiUrl, function (err, results) {
            if (err || !results || !results.results.priceDate) {
                //console.log('error : ', err + ' ' +  !results + ' ' +  !results.results.priceDate);
                cb(err);
            } else {
                priceDate =  getTransformedDateOject(results.results.priceDate[0].date);
                source =  results.results.priceDate[0].url;

                console.log('received price date: ', results.results.priceDate[0].date);
                console.log('received price transformed date: ', priceDate);
                console.log('received price url: ', source);
                //console.log(results);

                checkInDbAndWrite(priceDate, source, cropList, results.results.prices, cb);
            }
        });
    };

    this.getCropList = function (cb) {
        Crop
            .find({})
            .lean()
            .exec(cb);
    };

    function getAvgPrice (minPrice, maxPrice) {

        if ((minPrice === 0) || (maxPrice === 0)) {
            return ((minPrice === 0) ? maxPrice : minPrice);
        }
        return ((minPrice * 100 + maxPrice * 100) / 200);
    }

    function getDataByUrl(url, cb) {
        request(url, function (err, response, body) {
            var parsedBody = new ParsedBody({body: body});

            parsedBody.save();

            if (!body) {
                return cb(new Error('body is empty (check your connection to internet)'));
            }
            if ((/</.test(body))) {
                console.log('!!!! recieved Body has <DOCTYPE>   !!!!');

            } else {
                cb(err, JSON.parse(body));
            }
        });
    }

    function createNewCropNotification(model, callback) {
        var notification;
        var saveOptions = {
            newCropPriceId: model._id,
            type: 'newCrop'
        };

        mailer.sendEmailNotificationToAdmin('4Farmers. New crop detected ', 'Hello. New crop was detected. Name:  ' + model.name + '. Source:  ' +   model.source);

        notification = new Notification(saveOptions);
        notification
            .save(function (err, model) {
                if (err) {
                    console.log('DB Notification err:' + err);
                    callback('DB Notification err:' + err);
                } else {
                    callback();
                }
            });
    }

    function checkInDbAndWrite(priceDate, source, cropList, parsedData, cb) {
        var searchQuery = {
            date: priceDate,
            source: source
        };
        var cropLen = cropList.length - 1;

        Price
            .findOne(searchQuery)
            .lean()
            .exec(function (err, price) {
                if (err) {
                    cb(err);
                } else {
                    if (price) {
                        console.log('not need update');
                        cb(null, true);
                    } else {

                        async.each(parsedData, function (item, callback) {
                            var foundPosition = -1;
                            var minPrice = parseFloat(item.minPrice) || 0;
                            var maxPrice = parseFloat(item.maxPrice) || 0;
                            var avgPrice = getAvgPrice(minPrice, maxPrice);
                            var saveOptions;
                            var price;

                            for (var i = cropLen; i >= 0; i--) {
                                if (cropList[i].wholeSaleNames.indexOf(item.name) >= 0 || cropList[i].plantCouncilNames.indexOf(item.name) >= 0 ) {
                                    foundPosition = i;
                                    i = -1;
                                }
                            }

                            saveOptions = {
                                source: item.url,
                                minPrice: minPrice,
                                maxPrice: maxPrice,
                                avgPrice: avgPrice,
                                date: priceDate,
                                name: item.name,
                                site: /moag/.test(item.url) ? CONST.WHOLE_SALE_MARKET : CONST.PLANT_COUNCIL,
                                year: moment(priceDate).year(),
                                month: moment(priceDate).month(),
                                dayOfYear: moment(priceDate).dayOfYear()
                            };

                            if (foundPosition >= 0) {
                                saveOptions._crop = cropList[foundPosition]._id;
                            } else {
                                console. log ('New crop detecdet: ', item.name);
                            }

                            price = new Price(saveOptions);
                            price
                                .save(function (err, model) {
                                    if (err) {
                                        callback('DB err:' + err);
                                    } else {
                                        if (foundPosition < 0) {
                                            createNewCropNotification (model.toJSON(), callback );
                                        } else {
                                            callback();
                                        }
                                    }
                                });
                        }, function (err) {
                            if (err) {
                                cb(err);
                            } else {
                                cb(null, false);
                            }
                        });
                    };
                }
            });
    };
};