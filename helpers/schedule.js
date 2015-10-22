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
            dataParser.getMergedCropList(function (err, result) {
                if (err) {
                    logWriter.log('scheduleJob -> getMergedCropList-> ' + err);
                }
                cropList = result;
                console.log('CropList loaded');
                //console.dir(cropList);
                cb();
            });
        });

        tasks.push(function (cb) {
            dataParser.syncCropPrices(constants.URL_APIS.PLANTS_URL.API_URL, cropList, function (err, result) {
                if (err) {
                    logWriter.log('scheduleJob -> syncPlantPrices -> ' + constants.URL_APIS.PLANTS_URL.SOURCE, err);
                }
                cb(err, result);
            });
        });

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

    console.log('Schedule started');
};
