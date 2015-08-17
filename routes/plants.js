var express = require( 'express' );
var router = express.Router();
var PlantHandler = require('../handlers/plants');

module.exports = function(db){
    var plants = new PlantHandler(db);

    router.get('/', plants.getList);
    router.get('/importFromCsv', plants.importFromCsv);
    router.get('/prices', plants.getPlantsWithPrices);

    return router;
};
