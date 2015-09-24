var _ = require('lodash');
var SessionHandler = require('./sessions');
var RESPONSE = require('../constants/response');
//var PlantsHelper = require("../helpers/plants");
//var ValidationHelper = require("../helpers/validation");


var User = function (db) {
    'use strict';

    var User = db.model('User');
    var mongoose = require('mongoose');
    var session = new SessionHandler(db);
    var crypto = require('crypto');
    var emailRegExp = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    var passRegExp = /^[\w\.@]{6,35}$/;

    function getUserById (userId, callback){

        User
            .findOne({_id: userId})
            //.select()
            .exec(function (err, model) {
                if (err) {
                    return callback(err);
                }

                if (model) {

                    return callback(null, model);
                } else {
                    return callback(new Error(RESPONSE.ON_ACTION.NOT_FOUND + ' user with such _id '));
                }
            });
    }

    this.registration = function (req, res, next) {
        var body = req.body;
        var email = body.email.toLowerCase();
        var pass = body.pass;
        var fullName = body.fullName;
        var shaSum = crypto.createHash('sha256');
        var userData;
        var user;

        if (!body || !email || !pass) {
            return res.status(400).send({error: RESPONSE.NOT_ENOUGH_PARAMS});
        }

        if (!emailRegExp.test(email)) {
            return res.status(400).send({error: RESPONSE.NOT_VALID_EMAIL});
        }

        if (!passRegExp.test(pass)) {
            return res.status(400).send({error: RESPONSE.NOT_VALID_PASS});
        }

        shaSum.update(pass);
        pass = shaSum.digest('hex');

        userData = {
            email: email,
            pass: pass,
            fullName: fullName
        };

        User
            .findOne({email: email})
            .exec(function (err, model) {
                if (err) {
                    return res.status(500).send({error: err});
                }
                if (model) {
                    return res.status(400).send({error: RESPONSE.AUTH.REGISTER_EMAIL_USED});
                }
                user = new User(userData);

                user
                    .save(function (err, user) {
                        if (err) {
                            return res.status(500).send({error: err});
                        }
                        return res.status(200).send({success: RESPONSE.AUTH.REGISTER});
                    });
            });
    };

    this.signIn = function (req, res, next) {

        var body = req.body;
        var email = body.email.toLowerCase();
        var pass = body.pass;
        var shaSum = crypto.createHash('sha256');

        if (!body || !email || !pass) {
            return res.status(400).send({error: RESPONSE.NOT_ENOUGH_PARAMS});
        }

        if (!emailRegExp.test(email)) {
            return res.status(400).send({error: RESPONSE.NOT_VALID_EMAIL});
        }

        if (!passRegExp.test(pass)) {
            return res.status(400).send({error: RESPONSE.NOT_VALID_PASS});
        }

        shaSum.update(pass);
        pass = shaSum.digest('hex');

        User
            .findOne({email: email, pass: pass})
            .exec(function (err, model) {
                if (err) {
                    return next(err)
                }

                if (!model) {
                    return res.status(400).send({error: RESPONSE.AUTH.INVALID_CREDENTIALS});
                }

                return session.register(req, res, model._id.toString(), model.userType);
            });
    };

    this.signOut = function (req, res, next) {
        return session.kill(req, res, next);
    };

    this.addServiceToFavorites = function ( req, res, next ) {
        var favorites = req.body.favorites;
        var userId = req.session.uId;
        var resultFavorites = [];
        var found = false;

        favorites = Array.isArray(favorites) ? favorites : [favorites];

        getUserById(userId, function (err, user) {
            user = user.toJSON();

            if (user.favorites.length) {

                for (var j = favorites.length - 1; j >= 0; j--) {
                    for (var i = user.favorites.length - 1; i >= 0; i--) {
                        if (user.favorites[i] == favorites[j]) {
                            found = true;
                        }
                    }
                    if (!found) {
                        resultFavorites.push(favorites[j]);
                    }
                    found = false;
                }
            } else {
                resultFavorites = favorites;
            }

            console.log('resultFavorites : ', resultFavorites);

            User
                .update({_id: user._id}, {$push: {'favorites': {$each: resultFavorites}}}, function (err, data) {
                    if (err) {
                        return res.status(400).send({error: err});
                    }
                    return res.status(200).send({success: RESPONSE.ON_ACTION.SUCCESS});
                });
        });
    };

    this.deleteServiceToFavorites = function ( req, res, next ) {
        var favorites = req.body.favorites;
        var userId = req.session.uId;
        var resultFavorites = [];
        var found = false;

        favorites = Array.isArray(favorites) ? favorites : [favorites];

        getUserById(userId, function (err, user) {
            user = user.toJSON();

            if (user.favorites.length){

                for (var i = user.favorites.length - 1; i >= 0; i--) {
                    for (var j = favorites.length - 1; j >= 0; j--) {
                        if (user.favorites[i] == favorites[j]) {
                            found = true;
                        }
                    }
                    if (!found) {
                        resultFavorites.push(user.favorites[i]);
                    }
                    found = false;
                }
            }

            console.log('resultFavorites : ', resultFavorites);

            User
                .update({_id: user._id}, {$set: {
                    'favorites': resultFavorites}}, function (err, data) {
                    if (err) {
                        return res.status(400).send({error: err});
                    }
                    return res.status(200).send({success: RESPONSE.ON_ACTION.SUCCESS});
                });
        });
    };

    this.getServicesFromFavorites = function ( req, res, next ) {
        var userId = req.session.uId;

        User
            .findOne({_id: userId})
            .exec(function (err, model) {
                if (err) {
                    return res.status(400).send({error: err});
                }
                //console.log(model.toJSON());
                return res.status(200).send(model.toJSON().favorites);
            })
    };
};

module.exports = User;