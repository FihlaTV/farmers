/**
 * Provides ability for:
 *  - User GET Crops List
 *  - Admin CRUD Crops List
 * @class crops
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

    /**
     * This __method__  for get CropList
     *
     * __URI:__ ___`/crops`___
     *
     * __METHOD:__ ___`GET`___
     *
     *
     * __Responses:__
     *
     *      status (200) JSON Array of objects: {[ {} , ...]}
     *      status (400, 500) JSON object: {error: 'Text about error'} or {error: object}
     *
     *
     * @example
     *      [
     *      {
     *      "englishName": "Avocado Etinger", // !!! this field WILL deprecated after testing !!!
     *      "displayName": "אבוקדו אטינגר"
     *      },
     *      {
     *      "englishName": "Avocado Ardit", // !!! this field WILL deprecated after testing !!!
     *      "displayName": "אבוקדו ארדיט"
     *      }, ....
     *      ]
     *
     * @method getMergedCropList
     * @instance
     * @for crops
     * @memberOf crops
     */

    //TODO del "englishName" field from response after testing
    router.get('/', crops.getMergedCropList);
    router.get('/cropQualitys', crops.getMergedCropList); // ?cropName=שום  response: ['pcQua.. ', 'WsQua '.... ]

    router.get('/prices', plants.getPlantsWithPrices);

    //import "cropList.csv" from /csv/ folder... TODO it on new server
    //router.get('/import', session.isAdmin, crops.adminImportFromCsv);
    router.get('/import', crops.adminImportFromCsv);

    return router;
};
