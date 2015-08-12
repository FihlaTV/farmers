/**
 * Created by kille on 12.08.2015.
 */
var csv = require('csv');
var fs = require('fs');
var _ = require('lodash');

var  parseCsvData = function (csvFile, callback) {

    var attributes; //first row - header of csv data

    fs.readFile(csvFile, 'utf8', function (err, stringFileData) {
        if (err) {
            callback(err);
        } else {
            csv.parse(stringFileData,{delimiter: ',', relax:true}, function (err, parsedData) {
                if (err) {
                    callback(err);
                }
                csv.transform(parsedData,
                    function (row) {
                        if (!attributes) {
                            attributes = row;
                            return null;
                        }
                        return row;
                    },
                    function (err, rows) {
                        var jsonData = _.map(rows, function (row) {
                            return _.object(attributes, row);
                        });
                        callback(null, jsonData, attributes);
                    })
            })
        }
    });
};

module.exports = parseCsvData;