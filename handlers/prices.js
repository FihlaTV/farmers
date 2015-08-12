/**
 * Created by kille on 12.08.2015.
 */
//var mongoose = require('mongoose');
var DataParser = require('../helpers/dataParser');

var Price = function ( db ) {
    var Price = db.model('Price');


    var dataParser = new DataParser(db);



    this.getPriceById = function (req,res,next){

    };

    this.syncVegetablePrices = function (req,res,next){
        dataParser.syncVegetablePrices(function(err, result){
            if (err) {
                next(err);
            } else {
                res.status(200).send(result);
            }
        });
    };

};

module.exports = Price;