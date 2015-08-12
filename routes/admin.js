/**
 * Created by eriy on 07.05.2015.
 */
var express = require( 'express' );
var path = require('path');
var router = express.Router();
var AdminHandler = require('../handlers/admin');

module.exports = function(db){
    var admin = new AdminHandler(db);

    router.post('/logIn', admin.logIn);
    router.get('/logOut', admin.logOut);
    router.get('/currentAdmin', admin.checkLogIn);

    return router;
};