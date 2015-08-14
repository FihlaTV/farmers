
var express = require( 'express' );
var router = express.Router();
var VegetableHandler = require('../handlers/vegetables');
//var SessionHandler = require('../handlers/sessions');
//var SchedulHandler = require('../handlers/schedule');

module.exports = function(db){

    var vegetables = new VegetableHandler(db);
    //var session = new SessionHandler(db);
    //var schedule = new SchedulHandler(db);

    router.get('/', vegetables.getList);
    router.get('/import', vegetables.importUniqVegetablesToDb);
    router.get('/importFromCsv', vegetables.importFromCsv);


    return router;
};