var logWriter = require('../modules/logWriter')();
var async = require('async');
var schedule = require('node-schedule');
var DataParser = require('../helpers/dataParser');
var moment = require("moment");
var constants = require("../constants/constants");

module.exports = function (db) {
    var dataParser = new DataParser(db);

    var Price = db.model('Price');
    var Vegetable = db.model('Vegetable');

    schedule.scheduleJob('*/3 * * * *', function() {
        console.log('scheduleJob -> syncVegetablePrices');

        async.series([ function (cb){
            dataParser.syncVegetablePrices(constants.URL_APIS.PLANTS_URL.API_URL, constants.URL_APIS.PLANTS_URL.SOURCE, function (err, result) {
                if (err) {
                    logWriter.log('scheduleJob -> syncVegetablePrices -> ' + constants.URL_APIS.PLANTS_URL.SOURCE, err);
                }
                cb(err, result);
            });
        }, function(cb){
            dataParser.syncVegetablePrices(constants.URL_APIS.MOAG_URL.API_URL, constants.URL_APIS.MOAG_URL.SOURCE, function (err, result) {
                if (err) {
                    logWriter.log('scheduleJob -> syncVegetablePrices -> ' + constants.URL_APIS.MOAG_URL.SOURCE, err);
                }
                cb(err, result);
            });
        }]);
    });

    console.log('Schedule started');
};
