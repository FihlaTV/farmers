var ImportCsv = require('../helpers/import');
var async = require('async');
var _ = require('lodash');


var Import = function (db) {
    var Plant = db.model('Plant');
    var Price = db.model('Price');

    var importCsv = new ImportCsv(db);


    this.importFromCsv = function (req, res, next) {
        var year = req.query.year;
        var csvFile = importCsv.getCsvFileName(year);

        if (csvFile === '') {
            return res.status(200).send('No file with such name');
        }

        importCsv.prepareData(csvFile, function (err, resultObj) {
            if (err) {
                next(err);
            } else {
                async.eachSeries(resultObj.newPlantsPrice, function (newPlantPrice, cb) {
                    importCsv.findPlantAndSavePrice(resultObj.plants, newPlantPrice, function (err, newPlant) {
                        if (err) {
                            cb(err)
                        } else if (newPlant && newPlant._id) {
                            resultObj.plants.push(newPlant);
                            cb();
                        } else {
                            cb();
                        }
                    });
                }, function (err) {
                    if (err) {
                        next(err);
                    } else {
                        res.status(200).send('Import was successful')
                    }
                });
            }
        });
    };
};

module.exports = Import;