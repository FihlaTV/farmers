/**
 * Created by kille on 12.08.2015.
 */
//var mongoose = require('mongoose');
var DataParser = require('../helpers/dataParser');

var Price = function (db) {
    var Price = db.model('Price');


    var dataParser = new DataParser(db);



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

    this.syncVegetablePrices = function (req,res,next){
        var DATA_URL = "https://www.kimonolabs.com/api/4fv5re1i?apikey=bG2G9Y4cVggvVGxEV3gSVEyatTIjbHP4";
        dataParser.syncVegetablePrices(DATA_URL, function(err, result){
            if (err) {
                next(err);
            } else {
                res.status(200).send(result);
            }
        });
    };

};

module.exports = Price;