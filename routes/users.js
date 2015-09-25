/**
 * Provides ability for:
 *  -   User: Register/ SignIn /SignOut,
 *  -   CRUD Users Favorites Services
 *
 * @class users
 *
 */

var express = require( 'express' );
var router = express.Router();
var UserHandler = require('../handlers/users');
var SessionHandler = require('../handlers/sessions');

module.exports = function(db){
    'use strict';

    var users = new UserHandler(db);
    var session = new SessionHandler(db);

    /**
     * This __method__ for user registration in App
     *
     * __URI:__ ___`/users/register`___
     *
     *  ## METHOD:
     * __POST__
     *
     *  ## Request:
     *      Body:
     *      email,
     *      pass,
     *      fullName
     *
     *  ## Responses:
     *      status (200) JSON object: { success: 'success'}
     *      status (400, 500) JSON object: {error: 'Text about error'} or {error: object}
     *
     * @example
     *      {
     *          email: 'client777@gmail.com',
     *          pass: 'pass1234',
     *          fullName: 'Avraam Rozenberg'
     *      }
     *
     * @method register
     * @for users
     * @memberOf users
     */

    router.post('/register', users.register);

    /**
     * This __method__  for user sign in App
     *
     * __URI:__ ___`/users/signIn`___
     *
     *  ## METHOD:
     * __POST__
     *
     *  ## Request:
     *      Body:
     *      email,
     *      pass,
      *
     *  ## Responses:
     *      status (200) JSON object: { success: 'success'}
     *      status (400, 500) JSON object: {error: 'Text about error'} or {error: object}
     *
     * @example
     *      {
     *          email: 'client777@gmail.com',
     *          pass: 'pass1234',
     *      }
     *
     * @method signIn
     * @for users
     * @memberOf users
     */

    router.post('/signIn', users.signIn);

    /**
     * This __method__  for user sign out from App
     *
     * __URI:__ ___`/users/signOut`___
     *
     *  ## METHOD:
     * __POST__
     *
     *  ## Request:
     *
     *  ## Responses:
     *      status (200) JSON object: { success: 'success'}
     *      status (400, 500) JSON object: {error: 'Text about error'} or {error: object}
     *
     * @method signOut
     * @for users
     * @memberOf users
     */

    router.post('/signOut', users.signOut);

    router.route('/favorites/')

    /**
     * This __method__  for user add crop (id of crop) to Favorites
     *
     * __URI:__ ___`/users/favorites`___
     *
     *  ## METHOD:
     * __POST__
     *
     *  ## Request:
     *      Body:
     *      favorites // String or [String, String, ...]
     *
     *  ## Responses:
     *      status (200) JSON object: { success: 'success'}
     *      status (400, 500) JSON object: {error: 'Text about error'} or {error: object}
     *
     *
     * @example
     *      {
     *          favorites: '5603f832f889260c19a40d59',
     *      }
     *      OR
     *      {
     *          favorites: ['5603f832f889260c19a40d59', '5603f832f889260c00a40d77' ],
     *      }
     *
     * @method addCropsToFavorites
     * @for users
     * @memberOf users
     */

        .post(session.isAuthenticatedUser, users.addCropsToFavorites)

    /**
     * This __method__  for user add crop (id of crop) to Favorites
     *
     * __URI:__ ___`/users/favorites`___
     *
     *  ## METHOD:
     * __GET__
     *
     *
     *  ## Responses:
     *      status (200) JSON Array of string: {[String, String, ...]}
     *      status (400, 500) JSON object: {error: 'Text about error'} or {error: object}
     *
     *
     * @example
     *      {
     *          [ '5601418844d8fb702665b0af',
     *          '5601418944d8fb702665b0b1',
     *          '5601418944d8fb702665b0b3',
     *          '5601418944d8fb702665b0c3' ]
     *      }
     *
     * @method addCropsToFavorites
     * @for users
     * @memberOf users
     */

        .get(session.isAuthenticatedUser, users.getServicesFromFavorites)
    /**
     * This __method__  for user add crop (id of crop) to Favorites
     *
     * __URI:__ ___`/users/favorites`___
     *
     *  ## METHOD:
     * __DELETE__
     *
     *  ## Request:
     *      Body:
     *      favorites // String or [String, String, ...]
     *
     *  ## Responses:
     *      status (200) JSON object: { success: 'success'}
     *      status (400, 500) JSON object: {error: 'Text about error'} or {error: object}
     *
     * @example
     *      {
     *          favorites: '5603f832f889260c19a40d59',
     *      }
     *      OR
     *      {
     *          favorites: ['5603f832f889260c19a40d59', '5603f832f889260c00a40d77' ],
     *      }
     *
     * @method deleteCropsFromFavorites
     * @for users
     * @memberOf users
     */
        .delete(session.isAuthenticatedUser, users.deleteCropsFromFavorites);

    router.post('/forgotPass', traCrmHandler.forgotPass);
    router.get('/changeForgotPass/:token', traCrmHandler.changeForgotPassForm);
    router.post('/changeForgotPass/:token', traCrmHandler.changeForgotPass);

    return router;
};
