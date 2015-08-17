var express = require( 'express' );
var router = express.Router();
var PricesHandler = require('../handlers/prices');

module.exports = function(db){
    var prices = new PricesHandler(db);

    return router;
};