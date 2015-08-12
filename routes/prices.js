/**
 * Created by kille on 12.08.2015.
 */

var express = require( 'express' );
var router = express.Router();
var PricesHandler = require('../handlers/prices');
//var SessionHandler = require('../handlers/sessions');
//var SchedulHandler = require('../handlers/schedule');

module.exports = function(db){

    var prices = new PricesHandler(db);
    //var session = new SessionHandler(db);
    //var schedule = new SchedulHandler(db);

    router.get('/', prices.getPriceById);
    router.get('/:date', prices.getPricesByDate);


    return router;
};