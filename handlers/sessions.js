var RESPONSE = require('../constants/response');

var Session = function (db) {
    'use strict';

    this.register = function (req, res, userId, userType) {
        req.session.loggedIn = true;
        req.session.uId = userId;
        req.session.type = userType;
        res.status(200).send({success: RESPONSE.AUTH.LOG_IN});
    };

    this.kill = function ( req, res, next ) {
        if(req.session) {
            req.session.destroy();
        }
        res.status(200).send({success: RESPONSE.AUTH.LOG_OUT});
    };

    this.authenticatedUser = function (req, res, next) {
        var err;

        if (req.session && req.session.uId && req.session.loggedIn) {
            next();
        } else {
            err = new Error('UnAuthorized');
            err.status = 401;
            next(err);
        }
    };

    this.isAdmin = function (req, res, next) {
        var err;

        if (req.session && req.session.type == 'Admin') {
            return next()
        }

        err = new Error('Permission denied');
        err.status = 403;

        next (err);
    };

    this.isAdminApi = function (req, res, next ) {
        res.status(403).send({error: "unauthorized"});
    };

    this.isAuthenticatedUser = function (req, res, next) {
        if (req.session && req.session.uId && req.session.loggedIn) {
            next();
        } else {
            var err = new Error('UnAuthorized');
            err.status = 401;
            next(err);
        }
    };
};

module.exports = Session;