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

describe('Marketeers GET LIST, ADD, CREATE, MERGE, DELETE? ,', function () {

    var agent = request.agent(url);
    var userId;
    var marketeerCollection;
    var preparingDb = new PreparingBd();
    var receivedCrops;

    before(function (done) {
        console.log('>>> before');

        async.series([
            //preparingDb.dropCollection(CONST.MODELS.USER + 's'),
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

    it('User Registration with GOD data', function (done) {
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
        var loginData = USERS.USER_GOOD_CREDENRIALS;
        var lastUser;

        preparingDb.getCollectionsByModelNameAndQueryAndSort(CONST.MODELS.USER, {'email': loginData.email}, {}, function (err, models){
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
    it('User signIn with GOOD data', function (done) {
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


    it('User GET Marketeers List', function (done) {

        agent
            .get('/marketeers/')
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

    it('GET Marketeer collection directly from DB', function (done) {

        preparingDb.getCollectionsByModelNameAndQueryAndSort(CONST.MODELS.MARKETEER, {}, {}, function (err, models){
            if (err) {
                return done(err)
            }
            if (!models) {
                return done(CONST.MODELS.MARKETEER + ' is empty');
            }

            marketeerCollection = models;
            //console.dir(marketeerCollection);
            done();
        });
    });

    it('User ADD Marketeer from Collections', function (done) {

        agent
            .post('/marketeers/')
            .send({fullName: marketeerCollection[0].fullName})
            .expect(200)
            .end(function (err, res) {
                console.dir(res.body);
                if (err) {
                    return done(err);
                }
                done();
            });
    });

    it('User on mainScreen (.getLast)  ', function (done) {
        agent
            .get('/prices/getLast/')
            .expect(200)
            .end(function (err, res) {
                console.dir(res.body);

                if (err) {
                    return done(err);
                }
                receivedCrops = res.body;

                if (res.body.length < 50) {
                    return done('response length < 50');
                }
                done();
            });
    });

    it('User select crop (.getCropPricesForPeriod)  ', function (done) {
        agent
            .get('/prices/getCropPricesForPeriod/?cropName=' + receivedCrops[0].displayName + '&startDate=' + new Date() + '&endDate=2015-04-20T12:09:12.000Z&isScroll=true')
            .expect(200)
            .end(function (err, res) {
                console.dir(res.body);
                if (err) {
                    return done(err);
                }
                if (res.body.length < 10) {
                    return done('response length < 10');
                }
                done();
            });
    });

    it('Admin ADD Marketeer FROM NOTIFICATION', function (done) {
        done('Not implemented');
    });

    it('Admin MERGE Marketeer FROM NOTIFICATION', function (done) {
        done('Not implemented');
    });
});