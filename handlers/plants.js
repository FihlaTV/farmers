var _ = require('lodash');
var PlantsHelper = require("../helpers/plants");
var ValidationHelper = require("../helpers/validation");


var Plant = function (db) {
    var Plant = db.model('Plant');
    var Price = db.model('Price');

    var plantsHelper = new PlantsHelper(db);
    var validationHelper = new ValidationHelper(db);


    this.getList = function (req, res, next) {
        Plant.find({}, function (err, docs) {
            if (err) {
                return next(err);
            } else {
                res.status(200).send(docs);
            }
        });
    };

    this.getPlantsWithPrices = function (req, res, next) {
        var date = req.query.date;

        date = validationHelper.convertUrlStringDate(date);

        plantsHelper.getPlantsWithPrices(date, function (err, result) {
            if (err) {
                next(err);
            } else {
                res.status(200).send(result);
            }
        })
    };

};

module.exports = Plant;