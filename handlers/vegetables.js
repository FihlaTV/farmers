/**
 * Created by kille on 12.08.2015.
 */

//var mongoose = require('mongoose');
var importCsv = require('../helpers/import');

var Vegetable = function (db) {
    var Vegetable = db.model('Vegetable');
    var self = this;

    this.importCsvToDb = function (req, res, next) {
        var csvFile = 'D:/Thinkmobiles/csvdata.csv';

        importCsv(csvFile, function (err, jsonData, attributes) {
            if (err) {
                return next(err);
            } else {
                Vegetable.create(jsonData, function (err, cteatedData) {
                    if (err) {
                        return next(err);
                    } else {
                        res.status(200).send(cteatedData);
                    }
                });
            }
        });
    };

    this.getList = function (req, res, next) {

        Vegetable.find({}, {englishName:1, jewishNames:1}, function(err, docs){
            if (err){
                return next(err);
            } else {
                res.status(200).send(docs);
            }
        });
    };
};

module.exports = Vegetable;