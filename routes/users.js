/**
 * Provides ability for:
 *  -   User: Register/ SignIn /SignOut / ChangePassowr / ForgotPassword
 *  -   CRUD Users Favorites Services
 *
 * @class users
 *
 */

var express = require('express');
var router = express.Router();
var UserHandler = require('../handlers/users');
var SessionHandler = require('../handlers/sessions');

module.exports = function (db) {
    'use strict';

    var users = new UserHandler(db);
    var session = new SessionHandler(db);

    /**
     * This __method__ for user registration in App
     *
     * __URI:__ ___`/users/register`___
     *
     * __METHOD:__ ___`POST`___
     *
     * __Request:__
     *
     *      Body:
     *      email,
     *      pass,
     *      fullName
     *
     * __Response:__
     *
     *      status (200) JSON object: { success: 'Send confirmation on email. Check Email'}
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
     * @instance
     * @for users
     * @memberOf users
     */

    router.post('/register', users.register);
    router.post('/signUpFb', users.signUpFb);
    router.get('/confirmEmail/:token', users.confirmEmail);

    /**
     * This __method__  for user sign in App
     *
     * __URI:__ ___`/users/signIn`___
     *
     * __METHOD:__ ___`POST`___
     *
     * __Request:__
     *
     *      Body:
     *      email,
     *      pass,
      *
     * __Response:__
     *
     *      status (200) JSON object: { success: 'success'}
     *      status (400, 500) JSON object: {error: 'Text about error'}, {error: 'Registration not confirmed. Check Email'} or {error: object}
     *
     * @example
     *      {
     *          email: 'client777@gmail.com',
     *          pass: 'pass1234',
     *      }
     *
     * @method signIn
     * @instance
     * @for users
     * @memberOf users
     */

    router.post('/signIn', users.signIn);

    /**
     * This __method__  for user sign out from App
     *
     * __URI:__ ___`/users/signOut`___
     *
     * __METHOD:__ ___`POST`___
     *
     *
     * __Response:__
     *
     *      status (200) JSON object: { success: 'success'}
     *      status (400, 500) JSON object: {error: 'Text about error'} or {error: object}
     *
     * @method signOut
     * @instance
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
     * __METHOD:__ ___`POST`___
     *
     * __Request:__
     *
     *      Body:
     *      favorites // String or [String, String, ...]
     *
     * __Response:__
     *
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
     * @instance
     * @for users
     * @memberOf users
     */

        .post(session.isAuthenticatedUser, users.addCropsToFavorites)

    /**
     * This __method__  for user add crop (id of crop) to Favorites
     *
     * __URI:__ ___`/users/favorites`___
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
     *          [ '5601418844d8fb702665b0af',
     *          '5601418944d8fb702665b0b1',
     *          '5601418944d8fb702665b0b3',
     *          '5601418944d8fb702665b0c3' ]
     *      }
     *
     * @method getCropsFromFavorites
     * @instance
     * @for users
     * @memberOf users
     */

        .get(session.isAuthenticatedUser, users.getCropsFromFavorites)

    /**
     * This __method__  for user delete crop (id of crop) from Favorites
     *
     * __URI:__ ___`/users/favorites`___
     *
     *__METHOD:__ ___`DELETE`___
     *
     * __Request:__
     *
     *      Body:
     *      favorites // String or [String, String, ...]
     *
     * __Response:__
     *
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
     * @instance
     * @for users
     * @memberOf users
     */

        .delete(session.isAuthenticatedUser, users.deleteCropsFromFavorites);

    /**
     * This __method__  for user to reset password. After used route, will send to user mail with link: http:\\ + token for reseting password
     *
     * __URI:__ ___`/users/forgotPass`___
     *
     * __METHOD:__ ___`POST`___
     *
     * __Request:__
     *
     *      Body:
     *      email //
     *
     * __Response:__
     *
     *      status (200) JSON object: { success: 'success'}
     *      status (400, 500) JSON object: {error: 'Text about error'}, {error: 'Registration not confirmed. Check Email'} or {error: object}
     *
     * @example
     *      {
     *          email: 'client777@gmail.com'
     *      }
     *
     * @method forgotPass
     * @instance
     * @for users
     * @memberOf users
     */

    router.post('/forgotPass', users.forgotPass);
    router.get('/changeForgotPass/:token', users.changeForgotPassGetForm);
    router.post('/changeForgotPass/:token', users.changeForgotPass);

    /**
     * This __method__  for user to reset password. After used route, will send email to user with link: http:\\ + token for reseting password
     *
     * __URI:__ ___`/users/changePass`___
     *
     * __METHOD:__ ___`POST`___
     *
     * __Request:__
     *
     *      Body:
     *      oldPass
     *      newPass
     *
     * __Response:__
     *
     *      status (200) JSON object: { success: 'success'}
     *      status (400, 500) JSON object: {error: 'Text about error'} or {error: object}
     *
     * @example
     *      {
     *          "oldPass": "123456",
     *          "newPass": "123456789",
     *      }
     *
     * @method changePassBySession
     * @instance
     * @for users
     * @memberOf users
     */

    router.post('/changePass/', session.isAuthenticatedUser, users.changePassBySession);
    router.get('/profile', session.isAuthenticatedUser, users.getUserProfileBySession);
    router.put('/profile', session.isAuthenticatedUser, users.updateUserProfileBySession);

    return router;
};
