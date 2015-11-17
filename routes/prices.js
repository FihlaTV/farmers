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
var DataParser = require('../helpers/dataParser');

module.exports = function(db){
    var prices = new PricesHandler(db);
    var dataParser = new DataParser(db);

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
     * This __method__  for All Crop Prices  Screen. Get all last Crop prices (in Calendar order)
     *
     * __URI:__ ___`prices/getCropPricesForPeriod`___
     *
     * __METHOD:__ ___`GET`___ with query: cropName, startDate, endDate
     *
     * __Request:__
     * ___`prices/getCropPricesForPeriod?cropName=שום&startDate=2016-10-27T12:09:12.000Z&endDate=2014-10-24T12:09:12.000Z`___
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

    /**
     * This __method__  for All Marketeer Prices  Screen. Get all Marketeer Crop prices (in Calendar order)
     *
     * __URI:__ ___`prices/getMarketeerCropPricesForPeriod`___
     *
     * __METHOD:__ ___`GET`___ with query: cropName, startDate, endDate
     *
     * __Request:__
     * ___`prices/getMarketeerCropPricesForPeriod?cropName=שום&startDate=2015-11-16T12:09:12.000Z&endDate=2014-10-24T12:09:12.000Z`___
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
     *       "data": "2015-11-13T12:00:00.000Z",
     *      "prices": [
     *                  {
     *                      "name": "חברת יוסף אופנהיימר (1986)",
     *                      "location": "שוק צריפין",
     *                      "price": null,
     *                      "quality": "",
     *                      "more": []
     *                  },
     *                  {
     *                      "name":  "שיווק המאה (מסחר) 2002",
     *                      "location": "השרון",
     *                      "price": 10.3,
     *                      "quality": "supper",
     *                      "more": [
     *                                  {
     *                                      "price": 10.3,
     *                                      "quality": "supper"
     *                                  }
     *                                  {
     *                                      "price": 8,
     *                                      "quality": "old"
     *                                  }
     *                                  {
     *                                      "price": 10,
     *                                      "quality": "excellent"
     *                                  }
     *                             ]
     *                  },
     *                  {
     *                      "name": "וסף אופנהיימר ",
     *                      "location": "שוק צ",
     *                      "price": 9,
     *                      "quality": "no bad",
     *                      "more": [
     *                                  {
     *                                      "price": 9,
     *                                      "quality": "no bad"
     *                                  },
     *                                  {
     *                                      "price": 5,
     *                                      "quality": "bad"
     *                                  },
     *                              ]
     *                  }
     *              ]
     *      },
     *
     *      {
     *       "data": "2015-11-13T12:00:00.000Z",
     *      "prices": [
     *                  {
     *                      "name": "חברת יוסף אופנהיימר (1986)",
     *                      "location": "שוק צריפין",
     *                      "price": 10,
     *                      "quality": "user quality",
     *                      "more": [
     *                                  {
     *                                      "price": 10,
     *                                      "quality": "user quality"
     *                                  }
     *                      ]
     *                  },
     *                  {
     *                      "name":  "שיווק המאה",
     *                      "location": "השרון",
     *                      "price": 10.3,
     *                      "quality": "supper",
     *                      "more": [....
     *                              ]
     *                   }
     *          },...
     *          ...]
     *
     * @method getMarketeerCropPricesForPeriod
     * @instance
     * @for prices
     * @memberOf prices
     */
    router.get('/getMarketeerCropPricesForPeriod', prices.getMarketeerCropPricesForPeriod);


    // not need
    //router.get('/getLastFavorites', prices.getLastFavorites);

    // for test  run parser
    router.get('/getWholeSalePrice', prices.getWholeSalePrice);
    // for test  run parser
    router.get('/getPlantCouncilPrice', prices.getPlantCouncilPrice);

    /**
     * This __method__  for ADD PRICE SCREEN. User add prices and quallity for marketeer
     *
     * __URI:__ ___`prices/addFarmerPrice`___
     *
     * __METHOD:__ ___`POST`___
     *
     * __Responses:__
     *
     *      Body:
     *          date//the date chosen by the user
     *          cropName // display crop name
     *          prices // []Array of prices and qualityes [ .. {"price": ..., "userQuality": ".."}...]
     *
     * __Response:__
     *
     *      status (200) JSON object: { success: 'success'}
     *      status (400, 500) JSON object: {error: 'Text about error'} or {error: object}
     *
     *
     * @example
     *      {
     *          "date":"2015-10-27 12:09:12.000Z",
     *          "cropName":"תפוזים טבורי",
     *          "prices": [
     *                     {
     *                          "price": 5.3,
     *                          "userQuality": "excellent"
     *                      },
     *                     {
     *                        "price": 5.5,
     *                       "userQuality": "excellent 50-70"
     *                     }
     *                      ]
     *        }
     *
     * @method addFarmerPrices
     * @instance
     * @for prices
     * @memberOf prices
     */
    router.post('/addFarmerPrice/', prices.addFarmerPrices);

    // pc2012.csv /pc2013.csv /pc2014.csv  without CSV
    router.get('/importPcHistoryFromCsv/:filename', dataParser.importPcHistoryFromCsv);
    router.get('/importWsMonthHistoryFromCsv/:filename', dataParser.importWsHistoryFromCsv);
    router.get('/getAveragePriceMonthly/:year', dataParser.getAveragePriceMonthly);


    return router;
};