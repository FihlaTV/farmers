var express = require( 'express' );
var router = express.Router();
var UserHandler = require('../handlers/users');
var SessionHandler = require('../handlers/sessions');

module.exports = function(db){
    'use strict';

    var users = new UserHandler(db);
    var session = new SessionHandler(db);

    //router.get('/', plants.getList);
    router.post('/registration', users.registration);
    router.post('/signIn', users.signIn);
    router.post('/signOut', users.signOut);

    router.route('/favorites/')
        .post(session.isAuthenticatedUser, users.addServiceToFavorites)
        .get(session.isAuthenticatedUser, users.getServicesFromFavorites)
        .delete(session.isAuthenticatedUser, users.deleteServiceToFavorites);

    return router;
};
