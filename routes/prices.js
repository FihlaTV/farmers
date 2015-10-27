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
     * This __method__  for Main Screen. Get all last Crop prices (in CropList order)
     *
     * __URI:__ ___`prices/getLast`___
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
     *      "englishName": "Onion Green",
     *      "displayName": "בצל ירוק",
     *      "isInFavorites": false,     *
     *      "image": "img/crops/Onion Green.jpg",
     *      "prices": [
     *          {
     *              "source": {
     *                  "type": "marketeer",
     *                  "name": "נ.ע.ם. שיווק פירות וירקות"
     *                         },
     *              "price": 0,
     *              "quality": ""
     *              "data": "2015-10-22T12:09:12.000Z",
     *              "more": []
     *          },
     *          {
     *              "source": {
     *               "type": "Wholesale",
     *                "name": "שוק סיטונאי"
     *                      },
     *              "price": 0,
     *              "quality": ""
     *              "data": "2015-10-22T12:09:12.000Z",
     *              "more": []
     *          },
     *          {
     *              "source": {
     *                  "type": "PlantCouncil",
     *                  "name": "מועצת הצמחים"
     *                         },
     *              "price": 10,
     *              "quality": "מובחר",
     *              "data": "2015-10-22T12:09:12.000Z",
     *              "more": [
     *                  {
     *                      "price": 10,
     *                      "quality": "מובחר"
     *                  },
     *                  {
     *                      "price": 9,
     *                      "quality": "סוג א"
     *                  }
     *                  ]
     *          }...
     *          ...]
     *
     * @method getLast
     * @instance
     * @for prices
     * @memberOf prices
     */

        //TODO del "englishName" field from response after testing
    router.get('/getLast', prices.getLast);
    /**
     * This __method__  for Main Screen. Get all last Crop prices (in CropList order)
     *
     * __URI:__ ___`prices/getCropPricesForPeriod`___
     *
     * __METHOD:__ ___`GET`___ with query: name, startDate, endDate
     *
     ** __Request:__
     * ___`prices/getCropPricesForPeriod?name=שום&startDate=2016-10-27T12:09:12.000Z&endDate=2014-10-24T12:09:12.000Z`___
     *
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
     *      "prices": [
     *                  {
     *                      "source": {
     *                      "type": "marketeer",
     *                      "name": ""
     *                                  },
     *                      "price": 0,
     *                      "quality": "",
     *                      "data": "2015-10-27T12:09:12.000Z",
     *                      "more": []
     *                  },
     *                  {
     *                      "source": {
     *                      "type": "Wholesale",
     *                      "name": "שוק סיטונאי"
     *                              },
     *                       "price": 13.8,
     *                       "data": "2015-10-27T12:09:12.000Z",
     *                       "more": [
     *                                {
     *                                "price": 13.8,
     *                                "quality": "ק' 50-20 א"
     *                                }
     *                  ]
     *      },
     *      {
     *      "prices": [
     *                 {
     *                        "source": {
     *                        "type": "marketeer",
     *                        "name": ""
     *                                   },
     *                        "price": 0,
     *                        "quality": "",
     *                        "data": "2015-10-23T12:09:12.000Z",
     *                        "more": []
     *                        },
     *                        {
     *                        "source": {
     *                        "type": "Wholesale",
     *                        "name": "שוק סיטונאי"
     *                                   },
     *                        "price": 13.8,
     *                        "quality": "ק' 50-20 א",
     *                        "data": "2015-10-23T12:09:12.000Z",
     *                        "more": [
     *                                 {
     *                                 "price": 17.15,
     *                                 "quality": "יבוא"
     *                                 },
     *                                 {
     *                                 "price": 13.8,
     *                                 "quality": "ק' 50-20 א"
     *                                 }
     *                                 ]
     *                        },
     *                        {
     *                         "source": {
     *                         "type": "PlantCouncil",
     *                         "name": "מועצת הצמחים"
     *                                   },
     *                         "price": 12,
     *                         "quality": "סוג א",
     *                         "data": "2015-10-23T12:09:12.000Z",
     *                         "more": [
     *                                 {
     *                                 "price": 12,
     *                                 "quality": "סוג א"
     *                                 }
     *                                 ]
     *          }...
     *          ...]
     *
     * @method getCropPricesForPeriod
     * @instance
     * @for prices
     * @memberOf prices
     */
    router.get('/getCropPricesForPeriod', prices.getCropPricesForPeriod);
    router.get('/getLastFavorites', prices.getLastFavorites);
    router.get('/getWholeSalePrice', prices.getWholeSalePrice);
    router.get('/getPlantCouncilPrice', prices.getPlantCouncilPrice);
    return router;
};