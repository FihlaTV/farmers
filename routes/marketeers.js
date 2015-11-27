/**
 * Provides ability for:
 *  -   User's Marketeer: ADD/ GET
 *  - Admin CRUD Crops List
 *
 * @class marketeer
 *
 */

var express = require('express');
var router = express.Router();
var MarketeerHandler = require('../handlers/marketeers');
var SessionHandler = require('../handlers/sessions');

module.exports = function (db) {
    'use strict';

    var marketeers = new MarketeerHandler(db);
    var session = new SessionHandler(db);


    router.route('/bySession')

    /**
     * This __method__  for user add marketeer
     *
     * __URI:__ ___`/marketeers/bySession`___
     *
     * __METHOD:__ ___`GET`___
     *
     * __Request:__
     *
     *
     * __Response:__
     *
     *      status (200) || 201 JSON object: { object }
     *      status (400, 500) JSON object: {error: 'Text about error'} or {error: object}
     *
     *
     * @example
     *      {
     *      "_marketeer": "56162b76c1d2b4088ee98b60",
     *      "fullName": "נ.ע.ם. שיווק פירות וירקות",
     *      "location": "שוק צריפין",
     *      "newMarketeer": false,
     *      "canChangeMarketeer": true // - if this  === false  User cant change marketeer
     *      }
     *
     * @method getMarketeerBySession
     * @instance
     * @for marketeer
     * @memberOf marketeer
     */
        .get(session.isAuthenticatedUser, marketeers.getMarketeerBySession);

    router.route('/')
    /**
     * This __method__  for user add marketeer
     *
     * __URI:__ ___`/marketeers`___
     *
     * __METHOD:__ ___`POST`___
     *
     * __Request:__
     *
     *      Body:
     *      fullName // String
     *
     * __Response:__
     *
     *      status (200) || 201 JSON object: { success: 'success'}
     *      status (400, 500) JSON object: {error: 'Text about error'} or {error: object}
     *
     *
     * @example
     *      {
     *          fullName: 'גלי משה- בוקר שיווק ואריזה',
     *      }
     *
     * @method addMarketeer
     * @instance
     * @for marketeer
     * @memberOf marketeer
     */

        .post(session.isAuthenticatedUser, marketeers.addMarketeer)

    /**
     * This __method__  for get Marketeer List
     *
     * __URI:__ ___`/marketeers`___
     *
     * __METHOD:__ ___`GET`___
     *
     *
     * __Responses:__
     *
     *      status (200) JSON Array of string: {[String, String, ...]}
     *      status (400, 500) JSON object: {error: 'Text about error'} or {error: object}
     *
     *
     * @example
     *      {
     *          [ 'גלי משה- בוקר שיווק ואריזה',
     *          'יבולי טירה שיווק פירות וירקות"',
     *          'עוזר איתן',
     *          'משק כרמי יצור ושיווק תוצרת חקלאית ',
      *          ]
     *      }
     *
     * @method getMarketterList
     * @instance
     * @for marketeer
     * @memberOf marketeer
     */

        .get(session.isAuthenticatedUser, marketeers.getMarketeerList);


    router.route('/marketeersList/:id')
        .put(session.isAdmin, marketeers.adminUpdateMarketeer)
        .delete(session.isAdmin, marketeers.adminDeleteMarketeer);

    router.route('/marketeersList')
        .get(session.isAdmin, marketeers.adminGetMarketeersList)
        .post(session.isAdmin, marketeers.adminCreateMarketeer);



    //import "marketeers.csv" from /csv/ folder... TODO it on new server
    router.get('/import', marketeers.adminImportFromCsv);
    //router.get('/import', session.isAdmin, marketeers.adminImportFromCsv);

    return router;
};
