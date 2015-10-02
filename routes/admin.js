var express = require('express');
var router = express.Router();
var AdminHandler = require('../handlers/admin');
var SessionHandler = require('../handlers/sessions');

module.exports = function (db) {
    'use strict';

    var admin = new AdminHandler(db);
    var session = new SessionHandler(db);

    router.post('/signIn', admin.signIn);
    router.post('/signOut', admin.signOut);
    router.post('/forgotPass', admin.forgotPass);
    router.get('/changeForgotPass/:token', admin.changeForgotPassGetForm);
    router.post('/changeForgotPass/:token', admin.changeForgotPass);
    router.post('/changePass/', session.isAuthenticatedUser, admin.changePassBySession);

    return router;
};
