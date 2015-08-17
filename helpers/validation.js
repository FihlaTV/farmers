var request = require("request");
var moment = require("moment");
var async = require('async');
var constants = require("../constants/constants");

module.exports = function (db) {
    var Plant = db.model('Plant');
    var Price = db.model('Price');

    this.convertUrlStringDate = function(stringDate) {
        if (stringDate && constants.REG_EXPS.URL_STRING_DATE.test(stringDate)) {
            return new Date(stringDate.replace(/-/g, '/'));
        } else {
            return new Date();
        }
    }

};