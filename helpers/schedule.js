var logWriter = require('../modules/logWriter')();
var async = require('async');
var schedule = require('node-schedule');
var DataParser = require('../helpers/dataParser');
var moment = require("moment");
var constants = require("../constants/constants");

module.exports = function (db) {
    var dataParser = new DataParser(db);

    var Price = db.model('Price');
    var Plant = db.model('Plant');
    var tasks = [];
    var cropList;

    //schedule.scheduleJob('*/3 * * * *', function() {
    schedule.scheduleJob('*/2 * * * *', function() {
        console.log('scheduleJob -> syncPlantPrices ' + new Date());
        tasks =[];

        tasks.push(function (cb) {
            dataParser.getCropList(function (err, result) {
                if (err) {
                    logWriter.log('scheduleJob -> getMergedCropList-> ' + err);
                }
                cropList = result;
                console.log('CropList loaded');
                //console.dir(cropList);
                cb();
            });
        });

        tasks.push(parseAndStoreDataFromPlantCouncil);

        async.series(
            tasks
            //    [ function (cb){
            //    dataParser.syncPlantPrices(constants.URL_APIS.PLANTS_URL.API_URL, constants.URL_APIS.PLANTS_URL.SOURCE, function (err, result) {
            //        if (err) {
            //            logWriter.log('scheduleJob -> syncPlantPrices -> ' + constants.URL_APIS.PLANTS_URL.SOURCE, err);
            //        }
            //        cb(err, result);
            //    });
            //}, function(cb){
            //    dataParser.syncPlantPrices(constants.URL_APIS.MOAG_URL.API_URL, constants.URL_APIS.MOAG_URL.SOURCE, function (err, result) {
            //        if (err) {
            //            logWriter.log('scheduleJob -> syncPlantPrices -> ' + constants.URL_APIS.MOAG_URL.SOURCE, err);
            //        }
            //        cb(err, result);
            //    });
            //}]
        );
    });

    function parseAndStoreDataFromPlantCouncil(cb) {
        dataParser.syncCropPrices(constants.URL_APIS.PLANTS_URL.API_URL, cropList, function (err, result) {
            if (err) {
                logWriter.log('scheduleJob -> syncPlantPrices -> ' + constants.URL_APIS.PLANTS_URL.SOURCE, err);
            }
            cb(err, result);
        });
    }

    function getWholeSalePrice(cb) {
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
                return cb(err);
            }
            console.log('Spend time: ', new Date() - startTime);
            return cb(err, result);
        });
    };

    console.log('Schedule started');
};
