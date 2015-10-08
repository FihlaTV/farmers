var request = require("request");
var moment = require("moment");
var async = require('async');
var PlantsHelper = require('../helpers/plants');
var CONST = require('../constants/constants');

module.exports = function (db) {
    var Plant = db.model('Plant');
    var Price = db.model('Price');
    var ParsedBody = db.model(CONST.MODELS.PARSED_BODY);

    var plantsHelper = new PlantsHelper(db);



    function getDateByUrl(url, cb) {
        request(url, function (err, response, body) {
            var parsedBody = new ParsedBody({body: body});

            parsedBody.save()

            if (!body){
                return cb(new Error('body is empty (check your connection to internet)'));
            }
            cb(err, JSON.parse(body));
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

        return new Date(date[2] + '/' + date[1] + '/' + date[0]);
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
        })
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
                    })
                }
            }
        });
    }
};