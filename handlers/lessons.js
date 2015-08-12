/**
 * Created by User on 28.04.2015.
 */
var lodash = require('lodash');
var async= require('async');
var mongoose = require('mongoose');
var ObjectId = mongoose.Types.ObjectId;
var Lessons = function(db){
    var Lessons = db.model('lesson');
    var Taxonomies = db.model('taxonomy');

    this.addLesson = function(req, res, next){
        var insertBody = req.body;
        var lessonId = req.params.id;

        var lessonText = insertBody.text;
        var arrayValues = insertBody.values;
        var arrayIds = insertBody.ids;
        var taxValues;
        var intersection;
        var unfilledTaxonomies = [];
        var index;
        var index1;
        var insertValues = [];
        var sendObj;
        var findObj;
        var lessonValues;
        var insertObj = [];
        var setText;

        if (lessonId){
            findObj = {
                _id: lessonId
            };
        } else {
            findObj = {
                _id: null
            };
        }

        var groupObj = {
            $group:{
                _id: {
                    name: '$taxonomyName'
                },
                valueIds: {$push: '$_id'}
            }
        };

        Taxonomies.aggregate([groupObj]).exec(function(err, resultTax){
            if (err){
                return next(err);
            }

            if (!resultTax.length){
                err = new Error('Taxonomies not found');
                err.status = 400;
                return next(err);
            }

            Lessons.findOne(findObj, function(err, resultLesson){
                if (err){
                    return next(err);
                }

                if (resultLesson){

                    lessonValues = lodash.map(resultLesson.taxonomyValues, function(v){
                       return v.toString();
                    });

                    if (lessonText){
                        setText = lessonText;
                    } else {
                        setText = resultLesson.text;
                    }

                    if (arrayValues && arrayIds && arrayValues.length && arrayIds.length) {
                        if (arrayValues.length !== arrayIds.length){
                            err = new Error('Not valid parameters');
                            err.status = 400;
                            return next(err);
                        }

                        insertObj = lodash.clone(resultLesson.taxonomyValues);

                        async.each(arrayIds, function(val, cb){

                            index = lessonValues.indexOf(val);
                            index1 = arrayIds.indexOf(val);
                            insertObj[index] = ObjectId(arrayValues[index1]);
                            cb(null);

                        }, function(err){
                            if (err){
                                return next(err);
                            }
                            Lessons.update({_id: lessonId}, {$set: {'taxonomyValues': insertObj, 'text': setText}}, function(err){
                               if (err){
                                   return next(err);
                               }
                               res.status(200).send({success: 'updated successfully'});
                            });
                        });
                    } else {
                        Lessons.update({_id: lessonId}, {$set: { 'text': setText}}, function(err){
                            if (err){
                                return next(err);
                            }
                            res.status(200).send({success: 'updated successfully'});
                        });
                    }

                } else {
                    async.each(resultTax, function(tax, cb){

                        taxValues = lodash.map(tax.valueIds, function(value) {
                            return value.toString();
                        });

                        intersection = lodash.intersection(taxValues, arrayValues);

                        if (!intersection.length){
                            unfilledTaxonomies.push(tax._id.name);
                            cb(null);
                        } else {

                            if (intersection.length > 1){
                                err = new Error('You must pick only one value from the taxonomy ' + tax._id.name);
                                err.status = 400;
                                return cb(err);
                            }

                            insertValues.push(ObjectId(intersection[0]));
                            cb(null);
                        }
                    }, function(err){
                        if (err){
                            return next(err);
                        }

                        if (unfilledTaxonomies.length){

                            sendObj = {
                                errMessage: 'You must pick correct value from below taxonomies',
                                taxonomies: unfilledTaxonomies
                            };

                            res.status(400).send(sendObj);
                        } else {

                            insertObj =  {
                                text: lessonText,
                                taxonomyValues: insertValues
                            };

                            resultLesson = new Lessons(insertObj);

                            resultLesson.save(function(err){
                                if (err){
                                    return next(err);
                                }

                                res.status(200).send({success: 'Lesson added successfully'});
                            });
                        }
                    });
                }
            });
        });
    };


    this.getLessons = function(req, res, next){
        var findObj = {};
        var lessonId = req.params.id;

        if (req.params.id){
            findObj = {
                _id: lessonId
            }
        }

        Lessons.find(findObj)
            .populate('taxonomyValues', 'value')
            .exec(function(err, result){
                if (err){
                    return next(err);
                }

                if (!result.length){
                    err = new Error('Lessons not found');
                    err.status = 400;
                    return next(err);
                }

                res.status(200).send(result);
            });
    };

    this.deleteLesson = function(req, res, next){
        var lessonId = req.params.id;

        Lessons.findByIdAndRemove(lessonId, function(err, result){
            if (err){
                return next(err);
            }

            if (!result){
                err = new Error('Lesson not found');
                err.status = 400;
                return next(err);
            }

            res.status(200).send({success: 'Lesson deleted successfully'});
        });
    }

    /*TODO REMOVE*/
    /*TEST*/
    this.testAddLessons = function( req, res, next ) {
        var lessonCount = 0;
        var groupObj = {
            $group:{
                _id: {
                    name: '$taxonomyName'
                },
                valueIds: {$push: '$_id'}
            }
        };

        Taxonomies.aggregate([ {$match: {value: {$ne: 'not defined'} }} ,groupObj], function( err, result ) {
            if ( err ) {
                return next( err );
            }

            function createOneLesson( result, lessonCount, callback ) {
                var lessonValues = [];

                async.each(
                    result,
                    function( oneTaxonomy, callback ) {
                        var count = oneTaxonomy.valueIds.length;
                        var randIndex = Math.floor( Math.random() * count );

                        lessonValues.push( oneTaxonomy.valueIds[ randIndex ]);

                        callback( null );
                    },
                    function() {
                        /*var lessonText = ObjectId().toString();*/
                        var model = new Lessons({
                            text: lessonCount.toString(),
                            taxonomyValues: lessonValues
                        });

                        model.save( callback );
                    }
                )

            }

            async.times(
                50,
                async.apply( createOneLesson, result ),
                function() {
                    res.status(200).send({ success: 'created testLessons'});
                }
            );
        })
    }

};

module.exports = Lessons;