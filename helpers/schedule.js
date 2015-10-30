var logWriter = require('../modules/logWriter')();
var async = require('async');
var schedule = require('node-schedule');
//var DataParser = require('../helpers/dataParser');
var DataParser = require('./dataParser');
var moment = require("moment");
var constants = require("../constants/constants");

module.exports = function (db) {
    var dataParser = new DataParser(db);

    var Price = db.model('Price');
    var Plant = db.model('Plant');
    var tasks = [];
    var cropList;

    //schedule.scheduleJob('*/3 * * * *', function() {
    schedule.scheduleJob('*/3 * * * *', function() {
    //schedule.scheduleJob('* 3 * * *', function() {
        console.log('scheduleJob -> syncPlantPrices ' + new Date());
        tasks =[];

        tasks.push(getCropList);
        tasks.push(parseAndStoreDataFromSites);

        async.series(tasks, function (err, result) {
            if(err) {
                console.log('ERROR:  Main Schedule Async ended with ERROR: ', err);
            } else {
                console.log('Main Schedule Async ended without error');
            }
        });
    });

    function getCropList (cb){
        dataParser.getCropList(function (err, result) {
            if (err) {
                logWriter.log('scheduleJob -> getMergedCropList-> ' + err);
            }
            cropList = result;
            console.log('CropList loaded');
            //console.dir(cropList);
            cb();
        });
    }

    function parseAndStoreDataFromSites(cb) {
        var parallelTasks = [];

        parallelTasks.push(parseAndStoreDataFromPlantCouncil);
        parallelTasks.push(parseAndStoreDataFromWholeSale);

        async.parallel(parallelTasks,  function (err, result) {
            cb(err, result);
        });
    }

    function parseAndStoreDataFromPlantCouncil(cb) {
        dataParser.syncPlantCouncilCropPrices(cropList, function (err, result) {
            if (err) {
                logWriter.log('scheduleJob -> syncPlantPrices -> ' + constants.URL_APIS.PLANTS_URL.SOURCE, err);
            }
            cb(err, result);
        });
    }

    function parseAndStoreDataFromWholeSale(cb) {

        dataParser.syncWholeSaleCropPrices(cropList, function (err, result) {
            if (err) {
                logWriter.log('scheduleJob -> syncPlantPrices -> ' + constants.URL_APIS.MOAG_URL.SOURCE_1, err);
            }
            cb(err, result);
        });
    }

    console.log('Schedule started');
};
