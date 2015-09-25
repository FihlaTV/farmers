'use strict';

var request = require('supertest');
var expect = require('chai').expect;
var mongoose = require('mongoose');
var CONST = require('../../constants/constants.js');
var USERS = require('./../testHelpers/usersTemplates');
var async = require ('async');
var PreparingBd = require('./preparingDb');
var url = 'http://localhost:8856';

describe('User Register and AUTH', function () {

    var agent = request.agent(url);
    before(function (done) {

        console.log('>>> before');

        var preparingDb = new PreparingBd();

        async.series([
            preparingDb.dropCollection('Users')
            //preparingDb.toFillUsers(1)
        ], function (err,results)   {
            if (err) {
                return done(err)
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
                    return done(err)
                }
                done();
            });
    });

    it('User Registration with BAD data', function (done) {
        var loginData = USERS.USER_BAD_EMAIL;

        agent
            .post('/users/register')
            .send(loginData)
            .expect(400)
            .end(function (err, res) {
                console.dir(res.body);
                if (err) {
                    return done(err)
                }
                done();
            });
    });

    it('User Registration with already USED EMAIL', function (done) {
        var loginData = USERS.USER_GOOD_CREDENRIALS;

        agent
            .post('/users/register')
            .send(loginData)
            .expect(400)
            .end(function (err, res) {
                console.dir(res.body);
                if (err) {
                    return done(err)
                }
                done();
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
                    return done(err)
                }
                done();
            });
    });

    it('User signIn with BAD data', function (done) {
        var loginData = USERS.USER_BAD_PASS;

        agent
            .post('/users/signIn')
            .send(loginData)
            .expect(400)
            .end(function (err, res) {
                console.dir(res.body);
                if (err) {
                    return done(err)
                }
                done();
            });
    });

    it('User signIn not Registered', function (done) {
        var loginData = USERS.USER_NOT_REGISTERED;

        agent
            .post('/users/signIn')
            .send(loginData)
            .expect(400)
            .end(function (err, res) {
                console.dir(res.body);
                if (err) {
                    return done(err)
                }
                done();
            });
    });

    it('User signOut', function (done) {

        agent
            .post('/users/signOut')
            .expect(200)
            .end(function (err, res) {
                console.dir(res.body);
                if (err) {
                    return done(err)
                }
                done();
            });
    });

    it('User signOut not Authorized', function (done) {

        agent
            .post('/users/signOut')
            .expect(200)
            .end(function (err, res) {
                console.dir(res.body);
                if (err) {
                    return done(err)
                }
                done();
            });
    });

    it('SignIn with GOOD Facebook Credentials', function (done) {
        done("Not discussed and not implemented");
    });

    it('SignIn with BAD Facebook Credentials', function (done) {
        done("Not discussed and not implemented");
    });


});