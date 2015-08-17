//var mongoose = require('mongoose');
var DataParser = require('../helpers/dataParser');
var moment = require("moment");
var constants = require("../constants/constants");

var Price = function (db) {
    var Price = db.model('Price');

};

module.exports = Price;