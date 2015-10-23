var request = require("request");
var moment = require("moment");
var async = require('async');
var PlantsHelper = require('../helpers/plants');
var CONST = require('../constants/constants');
var mailer = require('../helpers/mailer');
var $ = require('../public/js/libs/jquery/dist/jquery.js');
var Iconv = require('iconv-lite');
var http = require('http');

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
                console.log(body);

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

    // process getting date is different for sites that is why need different function

    this.syncCropPrices = function (apiUrl, cropList, cb) {
        var priceDate;
        var source;
        var tempArray = [];
        var resultPricesArray = [];

        getDataByUrl(apiUrl, function (err, results) {
            if (err || !results || !results.results.priceDate) {
                //console.log('error : ', err + ' ' +  !results + ' ' +  !results.results.priceDate);
                cb(err);
            } else {
                priceDate =  getTransformedDateOject(results.results.priceDate[0].date);
                source =  results.results.priceDate[0].url;
                tempArray = results.results.prices;

                console.log('received price date: ', results.results.priceDate[0].date);
                console.log('received price transformed date: ', priceDate);
                console.log('received price url: ', source);


                // prepare received array, separate on excellent quality and class A quality
                for (var i = 0, len = tempArray.length - 1; i <= len; i++){
                    if (tempArray[i].maxPrice) {
                        resultPricesArray.push(
                            {
                                price: tempArray[i].maxPrice,
                                name: tempArray[i].name,
                                url: source,
                                excellent: true
                            }
                        )
                    }
                    resultPricesArray.push(
                        {
                            price: tempArray[i].minPrice,
                            name: tempArray[i].name,
                            url: source
                        }
                    )
                }


                checkInDbAndWrite(priceDate, source, cropList, resultPricesArray, cb);
            }
        });
    };

    this.getMergedCropList = function (cb) {
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

            if (!body || response.statusCode === '404') {
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

        mailer.sendEmailNotificationToAdmin('4Farmers. New crop detected ', 'Hello.<br>New crop was detected. Name:  ' + model.name + '<br>Source:  ' +   model.source + ' <br>Excelent class for Plant Council: ' + model.excellent);

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

                        // eachSeries need only in check purpose
                        async.eachSeries(parsedData, function (item, callback) {
                            var foundPosition = -1;
                            var price = parseFloat(item.minPrice) || 0;
                            //var maxPrice = parseFloat(item.maxPrice) || 0;
                            //var avgPrice = getAvgPrice(minPrice, maxPrice);

                            var saveOptions;
                            var price;
                            var nameOptimize = item.name.replace (/ /g,'');
                            var searchQualityFlag =  item.excellent ? 'מובחר' : 'סוג א';

                            for (var i = cropLen; i >= 0; i--) {
                                if ( cropList[i].pcNameOptimize.indexOf(nameOptimize) >= 0 && cropList[i].pcQuality.indexOf(searchQualityFlag) >= 0) {
                                    foundPosition = i;
                                    i = -1;
                                }
                            }

                            saveOptions = {
                                source: item.url,
                                price: item.price,
                                date: priceDate,
                                name: item.name,
                                site: /moag/.test(item.url) ? CONST.WHOLE_SALE_MARKET : CONST.PLANT_COUNCIL,
                                year: moment(priceDate).year(),
                                month: moment(priceDate).month(),
                                dayOfYear: moment(priceDate).dayOfYear(),
                                excellent: !!item.excellent
                            };

                            if (foundPosition >= 0) {
                                saveOptions._crop = cropList[foundPosition]._id;
                                saveOptions.cropListName = cropList[foundPosition].displayName;
                                saveOptions.pcQuality = cropList[foundPosition].pcQuality;
                                saveOptions.wsQuality = cropList[foundPosition].wsQuality;

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

    this.parseWholesalesByUrl = function (item, cb) {

        return parseWholesalesByUrl(item, cb);
    };

    function  parseWholesalesByUrl(item, cb) {
        var self = this;
        var url = item.url;
        var results = item.results;

            request({url : url, encoding: null, headers: {
            'User-Agent': 'request'
        }}, function (err, response, body) {
            var date;
            var nextPage;
            var dateRegExp = /(0[1-9]|[12][0-9]|3[01])[- \/.](0[1-9]|1[012])[- \/.](19|20)\d\d/g;
            var trTagsArray;
            var nameRegExp = /(?:<FONT face='Arial' size=\d color='BLUE'>)([.\S\s]*?)(?:<)/m;
            var priceRegExp = /(?:<FONT face='Arial' size=1 color='DARKBLUE'>)([.\S\s]*?)(?:<)/m;
            var nextPageRegExp = /(?:<a href=)(.*)(?:>לדף הבא _<\/a>)/m;

            var name;
            var price;
            var translator = Iconv.decode(body, 'win1255');

            console.log(translator);
            body = translator;

            if (!body || response.statusCode == '404') {
                return cb('body is empty (check your connection to internet)');
            }

            date = body.match(dateRegExp)[0];
            nextPage = body.match(nextPageRegExp) ? (body.match(nextPageRegExp)[1]).replace(/\\/g,"/") : '';

            console.log('data: ', date);
            console.log('current URL: ', url);
            console.log('next page: ', nextPage);

            //trTagsArray = body.match(/<TR>([.\S\s]*?)<\/TR>/gm);

            trTagsArray = body.match(/<TR>([.\S\s]*?)<\/TR>/gm);

            //console.log(trTagsArray[0].match(nameRegExp));
            for (var i = 0, j = trTagsArray.length - 1; j >= 0; j--) {
                name = trTagsArray[i].match(nameRegExp)[1];
                price = trTagsArray[i].match(priceRegExp)[1];

                results.push({
                    price: price,
                    name: name,
                    url: url,
                    date: date
                });

                console.log('price: ', price, ' name: ', name);
                i++;
            }
            //console.log('price: ', priceRegExp.exec(trTagsArray));
            //console.log('price: ', priceRegExp.exec(trTagsArray)[1], ' Name: ', nameRegExp.exec(trTagsArray[1])[1]);
            //console.log('price: ', priceRegExp.exec(trTagsArray[2])[1], ' Name: ', nameRegExp.exec(trTagsArray[2])[1]);
            //console.log('price: ', priceRegExp.exec(trTagsArray[3])[1], ' Name: ', nameRegExp.exec(trTagsArray[3])[1]);
            //}
            if (!nextPage) {
                console.log('parsing ', results.length ,' crops');
                //results.push(trTagsArray);

                return cb(err, results);
            }
            return parseWholesalesByUrl ({url: nextPage, results: results}, cb);

        });
        //});
    };

    this.getPlantCouncilPrice = function (item, cb) {
        var self = this;
        var url = item.url;
        var results = item.results;

        request({url : url,  headers: {
            'User-Agent': 'request'
        }}, function (err, response, body) {
            var data;
            var dateRegExp = /(0[1-9]|[12][0-9]|3[01])[- \/.](0[1-9]|1[012])[- \/.](19|20)\d\d/g;
            var trTagsArray;
            var nameRegExp = /(?:<FONT face='Arial' size=\d color='BLUE'>)([.\S\s]*?)(?:<)/m;
            var p1P2NameRegExp = /(?:<td class="productName" style="width:249px;">)([.\S\s]*?)(?:<\/td><td style="width:115px;">)([.\S\s]*?)(?:<\/td><td style="width:115px;">)([.\S\s]*?)(?:<)/m;

            var match;
            var price;

            trTagsArray = body.match(/<tr class="(rgAltRow tblPricesAltCells|rgRow tblPricesCells)[.\S\s]*?<\/tr>/gm);


            //console.log(trTagsArray);
            console.log(trTagsArray.length);

            if (!body || response.statusCode == '404') {
                return cb('body is empty (check your connection to internet)');
            }
            //body = encoding.convert(body, "UTF-8", "Windows1255");

            data = body.match(dateRegExp)[0];
            match =  body.match(p1P2NameRegExp);

            console.log('data: ', data);
            console.log('current URL: ', url);
            console.log('match: ', match);
            console.log('match1: ', match[1].trim());
            console.log('match1: ', match[2].trim());
            console.log('match1: ', match[3].trim());



            //console.log(trTagsArray[0].match(nameRegExp));

            for (var i = 0, j = trTagsArray.length - 1; j >= 0; j--) {
                name = trTagsArray[i].match(nameRegExp)[1];
                price = trTagsArray[i].match(priceRegExp)[1];

                results.push({
                    minPrice: price,
                    name: name,
                    url: url
                });

                console.log('price: ', price, ' name: ', name);
                i++;
            }


            //console.log('price: ', priceRegExp.exec(trTagsArray));
            //console.log('price: ', priceRegExp.exec(trTagsArray)[1], ' Name: ', nameRegExp.exec(trTagsArray[1])[1]);
            //console.log('price: ', priceRegExp.exec(trTagsArray[2])[1], ' Name: ', nameRegExp.exec(trTagsArray[2])[1]);
            //console.log('price: ', priceRegExp.exec(trTagsArray[3])[1], ' Name: ', nameRegExp.exec(trTagsArray[3])[1]);
            //}
            cb(err, results);

        });


    };

};