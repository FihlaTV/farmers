/**
 * Created by eriy on 14.05.2015.
 */
var async = require('async');
var mongoose = require('mongoose');
var ObjectId = mongoose.Types.ObjectId;

var Taxonomy = function ( db ) {
    var Taxonomy = db.model('taxonomy');
    var Lesson = db.model('lesson');

    /*function getTaxonomyValues( taxonomyName, callback ) {
     Taxonomy.aggregate([
     { $match: { taxonomyName:taxonomyName } },
     { $group: { _id: "$taxonomyName", taxValues: { $addToSet: "$value" } } }
     ],
     function( err, result ) {
     if ( err ) {
     return callback( err );
     }
     if ( ! result.taxValues || ! result.taxValues instanceof Array ) {
     result.taxValues = []
     }

     callback( null, result.taxValues );
     });

     };*/

    /*function saveTaxonomyValue( taxonomyName, taxonomyLvl, taxonomyValue, callback ) {
        var newTaxonomyValue;

        Taxonomy
            .findOne( { taxonomyName: taxonomyName, value: taxonomyValue } )
            .exec( function ( err, taxonomyModel ) {
                if ( err ) {
                    return callback( err );
                }

                if ( ! taxonomyModel ) {
                    taxonomyModel = new Taxonomy({
                        taxonomyName : taxonomyName,
                        lvl : taxonomyLvl
                    });
                }

                taxonomyModel.value = taxonomyValue;

                taxonomyModel.save( callback );
            });

    }*/

    function addNewTaxonomy( taxonomyName, taxonomyLvl, callback ) {
        Taxonomy
            .findOne( { taxonomyName: taxonomyName })
            .exec( function (err, taxModel) {
                if ( err ) {
                    return callback( err );
                }

                if ( taxModel ) {
                    err = new Error('Taxonomy ' + taxonomyName + ' exist');
                    err.status = 409;
                    return callback( err );
                }

                taxModel = new Taxonomy({
                    taxonomyName: taxonomyName,
                    lvl: taxonomyLvl,
                    value: 'not defined'
                });

                taxModel.save( callback );
            })
    }

    function addNewTaxonomyValue ( taxonomyName, taxonomyLvl, value, callback ) {
        Taxonomy
            .findOne( { taxonomyName: taxonomyName, value: value } )
            .exec( function ( err, taxModel ) {
                if ( err ) {
                    return callback( err );
                }

                if ( taxModel ) {
                    err = new Error('Taxonomy value ' + value + ' exist');
                    err.status = 409;
                    return callback( err );
                }

                taxModel = new Taxonomy({
                    taxonomyName: taxonomyName,
                    lvl: taxonomyLvl,
                    value: value
                });

                taxModel.save( callback );

            } )
    }

    this.addNewValue = function( req, res, next ) {
        var taxName = req.params.name;
        var body = req.body;
        var value = body.value;
        console.log(value);

        Taxonomy
            .findOne( { taxonomyName: taxName, value: 'not defined' })
            .exec( function( err, taxModel ) {
                if ( err ) {
                    return next( err );
                }

                if (! taxModel || ! taxModel.lvl ) {
                    err = new Error('Bad request');
                    err.status = 400;
                    return next( err );
                }

                addNewTaxonomyValue( taxName, taxModel.lvl, value, function ( err, result ) {
                    if ( err ) {
                        return next( err );
                    }

                    res.status( 201 ).send( { success: 'Value added', taxonomyValue: result } )
                } )
            } )

    };

    this.deleteValue = function ( req, res, next ) {
        var valueId = req.params.id;

        Taxonomy
            .findOneAndRemove( { _id: ObjectId( valueId ), value: {$nin: ['not defined'] } })
            .exec( function ( err, removedValue ) {
                if ( err ) {
                    return next( err );
                }

                if (! removedValue ) {
                    err = new Error('Value not acceptable');
                    err.status = 400;

                    return next( err );
                }

                console.log( removedValue );

                Taxonomy
                    .findOne( { taxonomyName: removedValue.taxonomyName, value:'not defined' } )
                    .exec( function( err, defValue ) {
                        if ( err ) {
                            return next( err );
                        }

                        if ( ! defValue ) {
                            err = new Error('No default value');
                            err.status = 400;

                            return next( err );
                        }

                        Lesson
                            .update(
                                { taxonomyValues: removedValue._id },
                                { $set: { "taxonomyValues.$": defValue._id }},
                                { multi: true }
                            )
                            .exec( function ( err ) {
                                if ( err ) {
                                    return next( err );
                                }

                                res.status( 200 ).send( {success: 'Value deleted'} )
                            })
                    } );

            })
    };

    this.updateValue = function ( req, res, next ) {
        var valueId = req.params.id;
        var body = req.body;
        var updateCondition = {
            value: body.value
        };

        Taxonomy
            .findByIdAndUpdate( valueId, {$set: updateCondition })
            .exec( function ( err, result ) {
                if ( err ) {
                    return next( err );
                }

                if (! result ) {
                    err = new Error('No such value');
                    err.status = 400;

                    return next( err );
                }

                res.status( 201 ).send( { success: 'Updated'} );
            })
    };

    this.createTaxonomy = function ( req, res, next ) {
        var reqBody = req.body;
        var taxName = reqBody.taxonomyName;
        var taxLvl = reqBody.lvl;

        addNewTaxonomy( taxName, taxLvl, function (err, result) {
            if ( err ) {
                return next( err );
            }
            Lesson
                .update({},{$addToSet:{ taxonomyValues: result._id }}, { multi: true }, function ( err ) {
                    if ( err ) {
                        return next( err );
                    }

                    res.status( 200 ).send({ success: 'Taxonomy created', result: result });
                });


        })
    };

    this.updateTaxonomy = function ( req, res, next ) {
        var taxName = req.params.name;
        var body = req.body;
        var updateCondition = {
        };

        if ( body.taxonomyName ) {
            updateCondition.taxonomyName = body.taxonomyName
        }

        if ( body.lvl ) {
            updateCondition.lvl = body.lvl
        }

        Taxonomy
            .update( { taxonomyName: taxName }, { $set: updateCondition }, { multi: true } )
            .exec( function ( err, updateCount ) {
                if ( err ) {
                    return next( err );
                }

                if ( ! updateCount.n ) {
                    err = new Error('No such taxonomy');
                    err.status = 400;

                    return next( err );
                }

                res.status( 200 ).send( {success: 'Updated'} )
            });

    };

    this.deleteTaxonomy = function ( req, res, next ) {
        var taxName = req.params.name;

        Taxonomy
            .find( { taxonomyName: taxName }, {_id:1} )
            .exec( function( err, result ) {

                if ( err ) {
                    return next( err );
                }

                if ( ! result.length  ) {
                    err = new Error('Bad taxonomy');
                    err.status = 400;
                    return next( err );
                }

                Lesson
                    .update( {}, { $pull: { taxonomyValues: {$in: result} }}, { multi: true })
                    .exec( function( err ) {
                        if ( err ) {
                            return next( err );
                        }

                        Taxonomy
                            .remove( { taxonomyName: taxName })
                            .exec( function ( err ) {
                                if ( err ) {
                                    return next( err );
                                }

                                res.status( 200 ).send( {success: 'Taxonomy removed'} )
                            })
                    })
            })
    };

    this.getTaxonomy = function ( req, res, next ) {
        var taxName = req.params.name;
        var matchCondition  = {};

        if ( taxName ) {
            matchCondition.taxonomyName = taxName;
        }

        Taxonomy.aggregate([
            { $match: matchCondition },
            { $group:{_id: "$taxonomyName", lvl: { $first:"$$ROOT.lvl"} ,values: { $push: {_id: "$$ROOT._id", value: "$$ROOT.value"} }}}
        ], function( err, result) {
            if ( err ) {
                return next( err );
            }

            if  (taxName) {
                return res.status(200).send(result[0]);
            }
            res.status( 200 ).send( result );
        })
    };

    this.getValue = function(req, res, next){
        var id = req.params.id;

        Taxonomy.findOne({_id: ObjectId(id)}, function(err, result){
            if (err){
                return next(err);
            }

            if (!result){
                err = new Error('Value not found');
                err.status = 400;
                return next(err);
            }

            res.status(200).send(result);
        });
    }

    /*TODO REMOVE*/
    /*TEST*/
    this.testCreateTaxonomies = function ( req,res,next ) {

        var options = [
            {
                lvl: 1,
                count: 3,
                valueCount:[2, 3, 10]
            },
            {
                lvl: 2,
                count: 4,
                valueCount:[3, 5, 3, 4]
            },
            {
                lvl: 3,
                count: 1,
                valueCount:[1]
            }
        ];

        function createOne( option, callback ) {
            var i;
            var j;
            var model;

            for ( i = 0; i < option.count; i++ ) {

                model = new Taxonomy({
                    taxonomyName: "Lvl" + option.lvl + "Tax" + i,
                    value: "not defined",
                    lvl: option.lvl
                });

                model.save();

                for ( j = 0; j < option.valueCount[i]; j++ ) {

                    model = new Taxonomy({
                        taxonomyName:  "Lvl" + option.lvl + "Tax" + i,
                        value: "Lvl" + option.lvl + "Tax" + i + "Value" + j,
                        lvl: option.lvl
                    });

                    model.save()
                }
            }

            callback( null );
        }

        async.each(options, createOne, function() {
            res.status(200).send({succes:"Created Test Taxonomys. Wait 10 sec"});
        });

    }

};

module.exports = Taxonomy;