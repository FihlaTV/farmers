'use strict';

var request = require('supertest');
var expect = require('chai').expect;
var mongoose = require('mongoose');
var CONST = require('../../constants/constants');
var USERS = require('./../testHelpers/usersTemplates');
//var IMAGES = require('./../testHelpers/imageTemplates');
//var SERVICES = require('./../testHelpers/servicesTemplates');
var async = require ('async');
var PreparingBd = require('./preparingDb');
var url = 'http://localhost:7792';

describe('Favorites ADD, DELL, GET List  ,', function () {

    var agent = request.agent(url);
    var userId;
    var plantCollection;
    var preparingDb = new PreparingBd();

    before(function (done) {
        console.log('>>> before');

        async.series([
            //preparingDb.dropCollection(CONST.MODELS.USER + 's'),
            ////preparingDb.dropCollection(CONST.MODELS.ADMIN_HISTORY + 's'),
            ////preparingDb.dropCollection(CONST.MODELS.USER_HISTORY + 's'),
            //preparingDb.createServiceByTemplate(SERVICES.SERVICE_GET_DOMAIN_DATA_TMA_TRA_SERVICES),

            //preparingDb.toFillUsers(1)
        ], function (err, results) {
            if (err) {
                return done(err);
            }
            done();
        });
    });

    it('Delete user IF registered ', function (done) {
        var loginData = USERS.USER_GOOD_CREDENRIALS;

        agent
            .delete('/users/dellAccountByEmail/' + loginData.email)
            //.send(loginData)
            .expect(200)
            .end(function (err, res) {
                console.dir(res.body);
                if (err) {
                    return done(err);
                }
                done();
            });
    });


    it('User Registration with GOD data ', function (done) {
        var loginData = USERS.USER_GOOD_CREDENRIALS;

        agent
            .post('/users/register')
            .send(loginData)
            .expect(200)
            .end(function (err, res) {
                console.dir(res.body);
                if (err) {
                    return done(err);
                }
                done();
            });
    });

    it('User confirm registration ', function (done) {
        var lastUser;

        preparingDb.getCollectionsByModelNameAndQueryAndSort(CONST.MODELS.USER, { "email" :  USERS.USER_GOOD_CREDENRIALS.email }, {}, function (err, models){
            if (err) {
                return done(err);
            }
            if (!models) {
                return done(CONST.MODELS.USER + ' is empty');
            }

            lastUser = models[0];

            console.log('lastUser :', lastUser);
            agent
                .get('/users/confirmEmail/' + lastUser.confirmToken)
                .expect(200)
                .end(function (err, res) {
                    console.dir(res.body);
                    if (err) {
                        return done(err);
                    }
                    done();
                });
        });
    });

    it('User sign with GOD data ', function (done) {
        var loginData = USERS.USER_GOOD_CREDENRIALS;

        agent
            .post('/users/signIn')
            .send(loginData)
            .expect(200)
            .end(function (err, res) {
                console.dir(res.body);
                if (err) {
                    return done(err);
                }
                done();
            });
    });

    it('User GET Favorites List', function (done) {

        agent
            .get('/users/favorites/')
            .send()
            .expect(200)
            .end(function (err, res) {
                console.dir(res.body);
                if (err) {
                    return done(err);
                }
                done();
            });
    });

    it('GET Plant collection directly from DB', function (done) {

        preparingDb.getCollectionsByModelNameAndQueryAndSort(CONST.MODELS.CROP, {}, {}, function (err, models){
            if (err) {
                return done(err)
            }
            if (!models) {
                return done(CONST.MODELS.CROP + ' is empty');
            }

            plantCollection = models;
            //console.dir(plantCollection);
            done();
        });
    });

    it('ADD items to Favorites', function (done) {
        var plantsId = [];

        plantsId.push(plantCollection[0].displayName);
        plantsId.push(plantCollection[10].displayName);
        plantsId.push(plantCollection[20].displayName);
        plantsId.push(plantCollection[50].displayName);

        agent
            .post('/users/favorites/')
            .send({favorites: plantsId})
            .expect(200)
            .end(function (err, res) {
                console.dir(res.body);
                if (err) {
                    return done(err);
                }
                done();
            });
    });

    it('ADD ONE item to Favorites', function (done) {

        agent
            .post('/users/favorites/')
            .send({favorites: plantCollection[8].displayName})
            .expect(200)
            .end(function (err, res) {
                console.dir(res.body);
                if (err) {
                    return done(err);
                }
                done();
            });
    });

    it('ADD Duplicate items to Favorites', function (done) {
        var plantsId = [];

        plantsId.push(plantCollection[0].displayName);
        plantsId.push(plantCollection[10].displayName);
        plantsId.push(plantCollection[12].displayName);

        agent
            .post('/users/favorites/')
            .send({favorites: plantsId})
            .expect(200)
            .end(function (err, res) {
                console.dir(res.body);
                if (err) {
                    return done(err);
                }
                done();
            });
    });

    it('Delete ONE item from Favorites', function (done) {
        var plantsId = [];

        agent
            .delete('/users/favorites/' + plantCollection[0].displayName)
            .expect(200)
            .end(function (err, res) {
                console.dir(res.body);
                if (err) {
                    return done(err);
                }
                done();
            });
    });

     it('User GET result Favorites List', function (done) {

        agent
            .get('/users/favorites/')
            .send()
            .expect(200)
            .end(function (err, res) {
                console.dir(res.body);
                if (err) {
                    return done(err);
                }
                done();
            });
    });
});