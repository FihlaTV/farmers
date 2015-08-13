//var mongoose = require('mongoose');
var DataParser = require('../helpers/dataParser');

var Price = function (db) {
    var Price = db.model('Price');


    var dataParser = new DataParser(db);


    this.getPriceById = function (req, res, next) {

    };

    this.getPricesByDate = function (req, res, next) {
        var date;
        var badDate = req.query.date;
        var REGEXP_DATE = /[0-9]{4}-(0[1-9]|1[012])-(0[1-9]|1[0-9]|2[0-9]|3[01])/; //yyyy-MM-DD

        if (badDate && REGEXP_DATE.test(badDate)) {
            date = new Date(badDate.replace(/-/g, '/'));
        } else {
            date = new Date();
        }

        Price
            .find({date: date})
            //.find({})
            .populate('_vegetable')
            .exec(function (err, prices) {
                if (err) {
                    return next(err);
                } else {
                    res.status(200).send(prices);
                }
            });
    };

    this.syncVegetablePrices = function (req, res, next) {
        var DATA_URL = "https://www.kimonolabs.com/api/4fv5re1i?apikey=bG2G9Y4cVggvVGxEV3gSVEyatTIjbHP4";

        dataParser.syncVegetablePrices(DATA_URL, function (err, result) {
            if (err) {
                next(err);
            } else {
                res.status(200).send(result);
            }
        });
    };

};

module.exports = Price;