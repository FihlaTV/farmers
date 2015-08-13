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

    schedule.scheduleJob('*/15 * * * *', function() {
        console.log('scheduleJob -> syncVegetablePrices');
        dataParser.syncVegetablePrices(constants.URL_APIS.PLANTS_URL, function (err, result) {
            if (err) {
                logWriter.log("scheduleJob -> syncVegetablePrices", err);
            }
        });
    });

    console.log('Schedule started');
};
