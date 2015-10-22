/**
 * Provides ability for:
 *  - Crops image  GET / SET
 *  - Users Avatar GET / SET
 *  - Marketeers Avatar GET / SET
 * @class images
 *
 */

var express = require('express');
var router = express.Router();
var PlantHandler = require('../handlers/plants');
var CropHandler = require('../handlers/crops');
var SessionHandler = require('../handlers/sessions');

module.exports = function(db){
    var plants = new PlantHandler(db);
    var crops = new CropHandler(db);
    var session = new SessionHandler(db);

    return router;
};
