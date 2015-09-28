var _ = require('lodash');
var SessionHandler = require('./sessions');
var RESPONSE = require('../constants/response');
var CONST = require('../constants/constants');
//var PlantsHelper = require("../helpers/plants");
//var ValidationHelper = require("../helpers/validation");


var User = function (db) {
    'use strict';

    var User = db.model('User');
    var Chief = db.model('Chief');
    var mongoose = require('mongoose');
    var path = require('path');
    var mailer = require('../helpers/mailer');
    var crypto = require('crypto');
    var session = new SessionHandler(db);
    var emailRegExp = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    var passRegExp = /^[\w\.@]{6,35}$/;

    createDefaultAdmin();

    function generateConfirmToken() {
        var randomPass = require('../helpers/randomPass');
        return randomPass.generate();
    }

    function prepareChangePassEmail(model, confirmToken, callback) {
        var templateName = 'public/templates/mail/changePassword.html';
        var from = 'testFarmer  <' + CONST.FARMER_EMAIL_NOTIFICATION + '>';
        var resetUrl = process.env.HOST + ':' + process.env.PORT + '/'  + 'users/changeForgotPass/' + confirmToken;

        var mailOptions = {
            from: from,
            mailTo: model.email,
            title: 'Reset password',
            templateName: templateName,
            templateData: {
                data: {
                    fullName: model.fullName,
                    resetUrl: resetUrl
                }
            }
        };

        mailer.sendReport(mailOptions, callback);
    }

    function prepareConfirmEmail(model, confirmToken, callback) {
        var templateName = 'public/templates/mail/confirmEmail.html';
        var from = 'testFarmer  <' + CONST.FARMER_EMAIL_NOTIFICATION + '>';
        var confirmUrl = process.env.HOST + ':' + process.env.PORT + '/'  + 'users/confirmEmail/' + confirmToken;

        var mailOptions = {
            from: from,
            mailTo: model.email,
            title: 'Confirm registration',
            templateName: templateName,
            templateData: {
                data: {
                    fullName: model.fullName,
                    confirmUrl: confirmUrl
                }
            }
        };

        mailer.sendReport(mailOptions, callback);
    }

    function createDefaultAdmin() {
        Chief
            .findOne({})
            .exec(function (err, model) {
                var pass = 'cropAdmin';
                var shaSum = crypto.createHash('sha256');
                var admin;

                shaSum.update(pass);
                pass = shaSum.digest('hex');

                admin = new Chief({
                    login: 'defaultAdmin',
                    pass: pass,
                    email: 'farmerAdmin@gmail.com',
                    updatedAt: new Date()
                });

                if (!model) {
                    admin
                        .save(function (err, user) {
                            if (user) {
                                console.log('Default Admin Created');
                            }
                        });
                }
            });
    }

    function getUserById(userId, callback){

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

    this.register = function (req, res, next) {
        var body = req.body;
        var email = body.email.toLowerCase();
        var pass = body.pass;
        var fullName = body.fullName;
        var shaSum = crypto.createHash('sha256');
        var confirmToken = generateConfirmToken();
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
            fullName: fullName,
            confirmToken: confirmToken
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
                    .save(function (err, model) {
                        if (err) {
                            return res.status(500).send({error: err});
                        }

                        console.log(model);

                        prepareConfirmEmail(model, confirmToken, function (err, result) {
                            if (err) {
                                return next(err);
                            }
                            res.status(200).send({success: RESPONSE.AUTH.REGISTER_SEND_CONFIRMATION});
                        });
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
                if (!(model.confirmToken === null)) {
                    return res.status(400).send({error: RESPONSE.AUTH.EMAIL_NOT_CONFIRMED});
                }

                return session.register(req, res, model._id.toString(), model.userType);
            });
    };

    this.signOut = function (req, res, next) {
        return session.kill(req, res, next);
    };

    this.addCropsToFavorites = function ( req, res, next ) {
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

    this.deleteCropsFromFavorites = function ( req, res, next ) {
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

    this.getCropsFromFavorites = function ( req, res, next ) {
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

    this.forgotPass = function(req, res, next) {
        var passToken = generateConfirmToken();
        var searchQuery = {
            'email': req.body.email
        };
        var data = {
            changePassToken: passToken
        };

        if (!req.body || !req.body.email) {
            return res.status(400).send({error: RESPONSE.NOT_ENOUGH_PARAMS});
        }

        User
            .findOneAndUpdate(searchQuery,data)
            .exec(function (err, model) {
                if (err) {
                    return res.status(500).send({error: err});
                }
                if (!model) {
                    return res.status(400).send({error: RESPONSE.AUTH.EMAIL_NOT_REGISTERED});
                }
                if (!(model.confirmToken === null)) {
                    return res.status(400).send({error: RESPONSE.AUTH.EMAIL_NOT_CONFIRMED});
                }

                prepareChangePassEmail(model, passToken, function (err, result) {
                    if (err) {
                        return next(err);
                    }
                    res.status(200).send({success: RESPONSE.ON_ACTION.SUCCESS});
                });
            });
    };

    this.changeForgotPassGetForm = function(req, res, next) {
        var token = req.params.token;
        var tokenRegExpstr = new RegExp( '^[' + CONST.ALPHABETICAL_FOR_TOKEN + ']+$');

        if (token.length < 30 || !tokenRegExpstr.test(token)) {
            return res.status(404).send();
        }

        User
            .findOne({'changePassToken': token})
            .exec(function (err, model) {

                if (err) {
                    return next(err);
                }
                if (!model) {
                    return res.status(404).send({error:  RESPONSE.ON_ACTION.NOT_FOUND});
                }
                res.sendFile(path.resolve(__dirname + '/../public/templates/customElements/changePass.html'));
            });
    };

    this.confirmEmail = function(req, res, next) {
        var token = req.params.token;
        var tokenRegExpstr = new RegExp( '^[' + CONST.ALPHABETICAL_FOR_TOKEN + ']+$');

        if (token.length < 30 || !tokenRegExpstr.test(token)) {
            return res.status(404).send();
        }

        User
            .findOneAndUpdate({'confirmToken': token}, {'confirmToken': null} )
            .exec(function (err, model) {

                if (err) {
                    return next(err);
                }
                if (!model) {
                    return res.status(404).send({error:  RESPONSE.ON_ACTION.NOT_FOUND});
                }
                return res.status(200).send({error:  RESPONSE.AUTH.REGISTER_EMAIL_CONFIRMED});
            });
    };

    this.changeForgotPass = function(req, res, next) {
        var newPass = req.body.newPass;
        var confirmPass = req.body.confirmPass;
        var token = req.params.token;
        var searchQuery = {
            changePassToken: token
        };
        var shaSum = crypto.createHash('sha256');
        var pass;
        var data;
        var tokenRegExpstr = new RegExp( '^[' + CONST.ALPHABETICAL_FOR_TOKEN + ']+$');

        shaSum.update(newPass);
        pass = shaSum.digest('hex');

        data = {
            pass: pass,
            changePassToken: null
        };

        //TODO password validation when customer will describe the requirements for a password
        if (newPass !== confirmPass) {
            return res.status(400).send({error: RESPONSE.NOT_ENOUGH_PARAMS + ': password and confirmation are not equal'});
        }

        //TODO check this condition in future
        if (token.length < 30 || !tokenRegExpstr.test(token)) {
            return res.status(404).send();
        }

        User
            .findOneAndUpdate(searchQuery, data)
            .exec(function (err, model){
                if (err){
                    return res.status(500).send({error: err });
                }
                if (!model){
                    return res.status(400).send({error: RESPONSE.NOT_ENOUGH_PARAMS + ': bad token'});
                }
                return res.send('The password was successfully changed');
            });
    };

    this.changePassBySession = function(req, res, next) {
        var oldPass = req.body.oldPass;
        var newPass = req.body.newPass;
        var shaSum = crypto.createHash('sha256');
        var userId = req.session.uId;
        var searchQuery;
        var data;

        shaSum.update(oldPass);
        oldPass = shaSum.digest('hex');

        //TODO password validation when customer will describe the requirements for a password

        searchQuery = {
            "_id": userId,
            pass: oldPass
        };

        shaSum = crypto.createHash('sha256');
        shaSum.update(newPass);
        newPass = shaSum.digest('hex');

        data = {
            pass: newPass
        };

        User
            .findOneAndUpdate(searchQuery, data)
            .exec(function (err, model){
                if (err){
                    return res.status(500).send({error: err });
                }
                if (!model){
                    return res.status(400).send({error: RESPONSE.NOT_ENOUGH_PARAMS + ': bad old password'});
                }
                // SEND to user's web browser
                return res.status(200).send({success: RESPONSE.ON_ACTION.SUCCESS});
            });
    };

    this.getUserProfileBySession = function ( req, res, next ) {
        var userId = req.session.uId;

        getUserById(userId, function (err, profile) {
            profile = profile.toJSON();

            if (err) {
                return next(err);
            }
            return res.status(200).send(profile);
        });
    };
};

module.exports = User;