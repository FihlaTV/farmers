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

    /**
     * This __method__ for user registration in App via Facebook account
     *
     * __URI:__ ___`/users/signUpFb`___
     *
     * __METHOD:__ ___`POST`___
     *
     * __Request:__
     *
     *      Body:
     *      email, // or null, if not exist
     *      fbId,  // String
     *      fullName, // String
     *      avatar, // String or null, if not exist
     *      fbAccessToken // String
     *
     *
     * __Response:__
     *
     *      status (200) JSON object: { success: 'Login successful'}
     *      status (400, 500) JSON object: {error: 'Text about error'} or {error: object}
     *
     * @example
     *      {
     *      "email": "232323@ukr.net",
     *      "fullName": "Serj Brin",
     *      "avatar": "https://scontent.xx.fbcdn.net/hprofile-xfp1/v/t1.0-1/c0.0.50.50/p50x50/10505612_1625178507707799_8991354025924380315_n.jpg?oh=a5e8a4333818c8ccfb7958d4b37725cc&oe=5692005F",
     *      "fbId": "889106887840848"
     *      "fbAccessToken": "CAAMoo1Q3lFABACrZATmqZAQFZA18m40VSN4sjNYgyPVZB1DWXdp2ZBrzlznNBx6NVe2qfwj23Psh6IorastLhMy6zUXk176qKcmFC1sNtwJMZBAKPQLXZCO96XRg9jzBc5OBl7PKFUKo8rzHzbbMCoZCosg4SkXk8gHk2DLeRg6Np5Y9x4t94ZABSZCipjZBAKEwGQZD"
     *      }
     *
     * @method signUpFb
     * @instance
     * @for users
     * @memberOf users
     */


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

    /**
     * This __method__  for user get profile by session. At now (wile not strong DB structure)  it take all field's
     *
     * __URI:__ ___`/users/profile`___
     *
     * __METHOD:__ ___`GET`___
     *
     *
     * __Responses:__
     *
     *      status (200) JSON object: {}
     *      status (400, 500) JSON object: {error: 'Text about error'} or {error: object}
     *
     *
     * @example
     *      {
     *      "_id": "560e4f45899308c80d294e34",
     *      "email": "smsspam@ukr.net",
     *      "pass": "a552b653b9434e5abd7ba559d1a07cb9b6d9386cf9a07b38b6bd27e0ebd479fd",
     *      "fullName": "Roberto Edinburg",
     *      "confirmToken": null,
     *      "fbId": "1899544646937849",
     *      "avatar": "https://scontent.xx.fbcdn.net/hprofile-xfp1/v/t1.0-1/c0.0.50.50/p50x50/10505612_1625178507707799_8991354025924380315_n.jpg?oh=a5e8a4333818c8ccfb7958d4b37725cc&oe=5692005F",
     *      "__v": 0,
     *      "updatedAt": "2015-10-02T09:32:53.979Z",
     *      "createdAt": "2015-10-02T09:32:53.979Z",
     *      "marketeer": null,
     *      "favorites": [],
     *      "newMarketeer": false, // if true - don't show ADD  marketeer screen, marketeer is added but NOT approved
     *      "marketeer": "561270af9c8fd4643656abd2", // or null if user not select marketeer.  If (marketeer == null) AND (newMarketeer == false) SHOW ADD  marketeer screen
     *      }
     *
     * @method getUserProfileBySession
     * @instance
     * @for users
     * @memberOf users
     */

    router.get('/profile', session.isAuthenticatedUser, users.getUserProfileBySession);
    router.put('/profile', session.isAuthenticatedUser, users.updateUserProfileBySession);


    /**
     * This __method__  for Developer or Tester to delete account by email and make logOut for kill session
     *
     * __URI:__ ___`/users/dellAccountByEmail/`___
     *
     * __METHOD:__ ___`DELETE`___
     *
     * __Request:__
     * ___`/users/dellAccountByEmail/mail@mail.ru`___
     *
     *
     * __Response:__
     *
     *      status (200) JSON object: {"success": "success"}
     *      status (400, 500) JSON object: {error: 'Text about error'} or {error: object}
     *
     *
     * @method dellAccountByEmail
     * @instance
     * @for users
     * @memberOf users
     */

    //TODO delete route after tests complete
    //TODO Warning only for testers! Check this end Delete

    router.delete('/dellAccountByEmail/:email', users.dellAccountByEmail);
    /**
     * This __method__  for Developer or Tester to delete account by email and make logOut for kill session
     *
     * __URI:__ ___`/users/dellAccountBySession/`___
     *
     * __METHOD:__ ___`DELETE`___
     *
     *
     * __Response:__
     *
     *      status (200) JSON object: {"success": "Logout successful"}
     *      status (400, 500) JSON object: {error: 'Text about error'} or {error: object}
     *
     *
     * @method dellAccountBySession
     * @instance
     * @for users
     * @memberOf users
     */
    router.delete('/dellAccountBySession', users.dellAccountBySession);

    return router;
};
