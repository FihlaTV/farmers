var express = require('express');
var router = express.Router();
var PlantHandler = require('../handlers/plants');
var CropHandler = require('../handlers/crops');
var SessionHandler = require('../handlers/sessions');

module.exports = function(db){
    var plants = new PlantHandler(db);
    var crops = new CropHandler(db);
    var session = new SessionHandler(db);

    router.get('/', crops.getList);

    router.get('/prices', plants.getPlantsWithPrices);

    //import "cropList.csv" from /csv/ folder... TODO it on new server
    router.get('/import', session.isAdmin, crops.adminImportFromCsv);

    return router;
};
