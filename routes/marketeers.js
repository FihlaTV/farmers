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
     *          fullName: 'Iakov Rouzas',
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
     *          [ 'Avraam Rihtenberg',
     *          'Noah Fotten',
     *          'Ioan Brin',
     *          'Antonio Banderas',
      *          ]
     *      }
     *
     * @method getMarketterList
     * @instance
     * @for marketeer
     * @memberOf marketeer
     */

        .get(session.isAuthenticatedUser, marketeers.getMarketeerList);

    router.post('/create', session.isAdmin, marketeers.adminCreateNewMarketeer);
    router.post('/merge', session.isAdmin, marketeers.adminMergeMarketeer);
    router.post('/add', session.isAdmin, marketeers.adminAddNewMarketeer);

    //import "marketeers.csv" from /csv/ folder... TODO it on new server
    router.get('/import', session.isAdmin, marketeers.adminImportFromCsv);

    return router;
};
