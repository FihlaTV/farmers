/**
 * Created by kille on 12.08.2015.
 */
//var mongoose = require('mongoose');


var Price = function (db) {
    var Price = db.model('Price');
    var self = this;


    this.getPriceById = function (req, res, next) {

    };

    this.getPricesByDate = function (req, res, next) {
        var badDate = req.params.date;
        var year = badDate.substr(0, 4);
        var month = badDate.substr(5, 2);
        var day = badDate.substr(8, 2);
        var date = new Date(year + '/' + month + '/' + day);

        if (date) {
            Price.find({}).populate('_vegetable').exec(function (err, prices) {
                if (err) {
                    return next(err);
                } else {

                    res.status(200).send(prices);
                }
            });
        }

    };

};

module.exports = Price;