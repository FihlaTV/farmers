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
var url = 'http://localhost:8856';

describe('Favorites ADD, DELL, GET List  ,', function () {

    var agent = request.agent(url);
    var userId;
    var plantCollection;
    var preparingDb = new PreparingBd();

    before(function (done) {
        console.log('>>> before');

        async.series([
            preparingDb.dropCollection(CONST.MODELS.USER + 's'),
            ////preparingDb.dropCollection(CONST.MODELS.ADMIN_HISTORY + 's'),
            ////preparingDb.dropCollection(CONST.MODELS.USER_HISTORY + 's'),
            //preparingDb.createServiceByTemplate(SERVICES.SERVICE_GET_DOMAIN_DATA_TMA_TRA_SERVICES),

            //preparingDb.toFillUsers(1)
        ], function (err,results)   {
            if (err) {
                return done(err)
            }
            done();
        });
    });

    it('User Registration and signIn', function (done) {
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

        preparingDb.getCollectionsByModelNameAndQueryAndSort(CONST.MODELS.PLANT, {}, {}, function (err, models){
            if (err) {
                return done(err)
            }
            if (!models) {
                return done(CONST.MODELS.PLANT + ' is empty');
            }

            plantCollection = models;
            //console.dir(plantCollection);
            done();
        });
    });

    it('ADD items to Favorites', function (done) {
        var plantsId = [];

        plantsId.push(plantCollection[0]._id);
        plantsId.push(plantCollection[1]._id);
        plantsId.push(plantCollection[2]._id);
        plantsId.push(plantCollection[5]._id);

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
            .send({favorites: plantCollection[8]._id} )
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

        plantsId.push(plantCollection[0]._id);
        plantsId.push(plantCollection[5]._id);
        plantsId.push(plantCollection[10]._id);

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

    it('Delete items from Favorites', function (done) {
        var plantsId = [];

        plantsId.push(plantCollection[3]._id);
        plantsId.push(plantCollection[4]._id);
        plantsId.push(plantCollection[5]._id);

        agent
            .delete('/users/favorites/')
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

        agent
            .delete('/users/favorites/')
            .send({favorites: plantCollection[8]._id})
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