/**
 * Provides ability for:
 *  - User GET Statistics List
 *  - Admin CRUD Statistics List
 * @class statistics
 *
 */

var express = require('express');
var router = express.Router();
var StatisticsHandler = require('../handlers/statistics');
var SessionHandler = require('../handlers/sessions');

module.exports = function(db){
    var statistics = new StatisticsHandler(db);


    /**
     * This __method__  for get monthly price statistics Array of objects see  https://projects.invisionapp.com/share/383U0QUUG#/screens/95933326
     *
     * __URI:__ ___`/statistics/price`___
     *
     * __METHOD:__ ___`GET`___
     *
     * __Request:__
     *
     *      Query:
     *      cropName // required string
     *      quality // required string
     *
     *
     * ___`/statistics/price?cropName=ארטישוק ירוק&quality=סוג א`___
     *
     *
     * __Responses:__
     *
     *      status (200) JSON Array of objects: [ ... , ...]
     *      status (400, 500) JSON object: {error: 'Text about error'} or {error: object}
     *
     *
     * @example
     *      [
     *{
     *  "year": 2012,
     *  "month": 11,
     *  "pricePc": 11.06,
     *  "priceWs": 11,
     *  "priceMk": null
     *},
     *{
     *  "year": 2013,
     *  "month": 0,
     *  "pricePc": 13.22,
     *  "priceWs": 13,
     *  "priceMk": null
     *},
     *{
     *  "year": 2014,
     *  "month": 11,
     *  "pricePc": 10.36,
     *  "priceWs": null,
     *  "priceMk": null
     *}
     *]
     *  *
     * @method price
     * @instance
     * @for statistics
     * @memberOf statistics
     */



     /**
     *  This __method__  for get monthly price statistics Array of objects see  see https://projects.invisionapp.com/share/383U0QUUG#/screens/95933323
     *
     * __URI:__ ___`/statistics/price`___
     *
     * __METHOD:__ ___`GET`___
     *
     * * __Request:__
     *
     *      Query:
     *      cropName // required string
     *      quality // required string
     *      month // integer if need monthly statistics see  https://projects.invisionapp.com/share/383U0QUUG#/screens/95933323
     *
     *
     * ___`/statistics/price?cropName=ארטישוק ירוק&quality=סוג א&month=11`___
     *
     *
     * __Responses:__
     *
     *      status (200) JSON Array of objects: [ ... , ...]
     *      status (400, 500) JSON object: {error: 'Text about error'} or {error: object}
     *
     *
     * @example
     *      [
     *{
     *  "year": 2012,
     *  "month": 11,
     *  "pricePc": 11.06,
     *  "priceWs": 11,
     *  "priceMk": null
     *},
     *{
     *  "year": 2013,
     *  "month": 0,
     *  "pricePc": 13.22,
     *  "priceWs": 13,
     *  "priceMk": null
     *},
     *{
     *  "year": 2014,
     *  "month": 11,
     *  "pricePc": 10.36,
     *  "priceWs": null,
     *  "priceMk": null
     *}
     *]
     *
     * @method price
     * @instance
     * @for statistics
     * @memberOf statistics
     */
   // router.get('/monthlyPrice', statistics.getMonthlyPrice);

    router.get('/price', statistics.getPrice);



    return router;
};
