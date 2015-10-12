/**
 * Provides ability for:
 *  - User GET Prices of crops, with different parameters
 *  - User SET Prices of crop for Marketeer
 * @class prices
 *
 */

var express = require( 'express' );
var router = express.Router();
var PricesHandler = require('../handlers/prices');

module.exports = function(db){
    var prices = new PricesHandler(db);

    /**
     * This __method__  for get CropList
     *
     * __URI:__ ___`/getLast`___
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
     *      [ ...
     *      {
     *      "_crop": "561672bbf82da5f410348e76",
     *      "englishName": "Greenhouse Tomatoes",
     *      "displayName": "??????? ????",
     *      "isInFavorites": false,
     *      "image": null,
     *      "prices": [
     *          {
     *          "source": {
     *              "type": "marketeer",
     *              "name": "56162b75c1d2b4088ee98aea"
     *                     },
     *           "value": 0,
     *           "data": "2015-10-08T12:09:12.000Z",
     *           "more": []
     *          },
     *          {
     *          "source": {
     *              "type": "site",
     *              "name": "Wholesale"
     *          },
     *          "value": 0,
     *          "data": "2015-10-08T12:09:12.000Z",
     *          "more": []
     *          },
     *          {
     *          "source": {
     *              "type": "site",
     *              "name": "PlantCouncil"
     *          },
     *          "value": 12,
     *          "data": "2015-10-08T12:09:12.000Z",
     *          "more": [
     *                  {
     *                  "minPrice": 11.5,
     *                  "maxPrice": 12,
     *                  "avgPrice": 11.75,
     *                  "site": "PlantCouncil",
     *                  "name": "??????? ????????",
     *                  "date": "2015-10-08T12:09:12.000Z"
     *                  },
     *                  {
     *                  "minPrice": 11,
     *                  "maxPrice": 12,
     *                  "avgPrice": 11.5,
     *                  "site": "PlantCouncil",
     *                  "name": "??????? ????",
     *                  "date": "2015-10-08T12:09:12.000Z"
     *                  }
     *                  ]
     *              }
     *              ]},...
     *      ]
     *
     * @method getLast
     * @instance
     * @for prices
     * @memberOf prices
     */

        //TODO del "englishName" field from response after testing
    router.get('/getLast', prices.getLast);

    return router;
};