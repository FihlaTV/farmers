/**
 * Created by eriy on 29.04.2015.
 */
var crontab = require('node-crontab');
var jobArray = [];
var locJobArray = [];
var mainCounter = 0;
var counter = 0;
var async = require('async');


module.exports = function ( db ) {
    var User = db.model('user');
    var Plan = db.model('plan');
};