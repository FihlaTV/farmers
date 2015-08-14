//var mongoose = require('mongoose');
var DataParser = require('../helpers/dataParser');
var moment = require("moment");
var constants = require("../constants/constants");

var Price = function (db) {
    var Price = db.model('Price');
    var dataParser = new DataParser(db);

    this.getPricesByDate = function (req, res, next) {
        var date;
        var dateString = req.query.date;

        if (dateString && constants.REG_EXPS.VEGETABLE_PRICES_BY_DATE.test(dateString)) {
            date = new Date(dateString.replace(/-/g, '/'));
        } else {
            date = new Date();
        }

        Price
            .find({
                year: moment(date).year(),
                dayOfYear: moment(date).dayOfYear()
            })
            .populate('_vegetable')
            .exec(function (err, prices) {
                if (err) {
                    return next(err);
                } else {
                    res.status(200).send(prices);
                }
            });
    };

};

module.exports = Price;