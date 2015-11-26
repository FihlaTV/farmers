var _ = require('lodash');
var SessionHandler = require('./sessions');
var RESPONSE = require('../constants/response');
var CONST = require('../constants/constants');
var mongoose = require('mongoose');
var path = require('path');
var mailer = require('../helpers/mailer');
var crypto = require('crypto');
//var PlantsHelper = require("../helpers/plants");
//var ValidationHelper = require("../helpers/validation");


var Admin = function (db) {
    'use strict';

    var User = db.model('User');
    var Admin = db.model('Admin');
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

    function prepareCreateAdminEmail(model, pass, callback) {
        var templateName = 'public/templates/mail/notification.html';
        var from = '4Farmers  <' + CONST.FARMER_EMAIL_NOTIFICATION + '>';

        var mailOptions = {
            from: from,
            mailTo: model.email,
            title: 'Default admin for Farmers APP created',
            templateName: templateName,
            templateData: {
                data: {
                    notification: 'Hi. Default admin for Farmers APP created. Login: ' + model.login + '  \u000A Password: ' +  pass
                }
            }
        };

        mailer.sendReport(mailOptions, callback);
    }

    function createDefaultAdmin() {
        //TODO change email on real email from customer in Production version
        Admin
            .findOne({})
            .exec(function (err, model) {
                var textPass = (generateConfirmToken()).slice(0, 6);
                //var pass = 'FarmrersAppAdmin';
                var shaSum = crypto.createHash('sha256');
                var admin;
                var pass;

                shaSum.update(textPass);
                pass = shaSum.digest('hex');

                admin = new Admin({
                    login: CONST.DEFAULT_ADMIN.login,
                    fullName: 'no name',
                    pass: pass,
                    email:  CONST.DEFAULT_ADMIN.email
                });

                if (!model) {
                    admin
                        .save(function (err, user) {
                            if (user) {
                                console.log('Default Admin Created');

                                prepareCreateAdminEmail(user.toJSON(), textPass, function (err, result) {
                                    if (err) {
                                        //return next(err);
                                    } else {
                                        console.log('Default password was sending on email');
                                    }
                                });
                            }
                        });
                }
            });
    }

    this.signIn = function (req, res, next) {
        var body = req.body;
        var email = body.email;
        var login = body.login;
        var pass = body.pass;
        var shaSum = crypto.createHash('sha256');

        if (!body || !login || !pass) {
            return res.status(400).send({error: RESPONSE.NOT_ENOUGH_PARAMS});
        }

        //email = email.toLowerCase();
        //
        //if (!emailRegExp.test(email)) {
        //    return res.status(400).send({error: RESPONSE.NOT_VALID_EMAIL});
        //}

        if (!passRegExp.test(pass)) {
            return res.status(400).send({error: RESPONSE.NOT_VALID_PASS});
        }

        shaSum.update(pass);
        pass = shaSum.digest('hex');

        Admin
            .findOne({login: login, pass: pass})
            .lean()
            .exec(function (err, model) {
                if (err) {
                    return next(err);
                }

                if (!model) {
                    return res.status(400).send({error: RESPONSE.AUTH.INVALID_CREDENTIALS});
                }
                return session.adminRegister(req, res, model._id.toString(), 'Admin', model.login);
            });
    };

    this.signOut = function (req, res, next) {
        return session.kill(req, res, next);
    };

    //this.pullBranch = function (req, res, next) {
    //    console.log('Pull Branch run');
    //    var pull = require('simple-git')()
    //        .pull(function(err, update) {
    //            if(update && update.summary.changes) {
    //                res.status(200).send( 'Updates detected: ' + update.summary.changes );
    //                console.log('Pull Branch');
    //                process.exit();
    //            }
    //            res.status(200).send('No new commits detected');
    //        })
    //        .then(function() {
    //            console.log('pull done.');
    //        });
    //};

    this.forgotPass = function(req, res, next) {
        var passToken = generateConfirmToken();
        var data = {
            changePassToken: passToken
        };

        Admin
            .findOneAndUpdate({}, data)
            .exec(function (err, model) {
                if (err) {
                    return res.status(500).send({error: err});
                }

                prepareChangePassEmail(model, passToken, function (err, result) {
                    if (err) {
                        return next(err);
                    }
                    res.status(200).send({success: RESPONSE.AUTH.FORGOT_SEND_EMAIL});
                });
            });
    };

    this.getUiProfile = function(req, res, next) {

        Admin
            .findOne()
            .select('-_id login fullName')
            .lean()
            .exec(function (err, model) {
                if (err) {
                    return res.status(500).send({error: err});
                }

                return res.status(200).send({data: model});

            });
    };

    this.changeForgotPassGetForm = function(req, res, next) {
        var token = req.params.token;
        var tokenRegExpStr = new RegExp( '^[' + CONST.ALPHABETICAL_FOR_TOKEN + ']+$');

        if (token.length < 30 || !tokenRegExpStr.test(token)) {
            return res.status(404).send();
        }

        Admin
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

        Admin
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

        Admin
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
};

module.exports = Admin;