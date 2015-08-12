/**
 * Created by eriy on 19.05.2015.
 */
var mongoose = require('mongoose');
var path = require('path');
var ObjectId = mongoose.Types.ObjectId;
var applePusher = require('../helpers/apns')(path.join("config/SenseiProductionPushCertificate.p12"));

module.exports = function( db ) {
    var Push = db.model('push');
    var User = db.model('user');
    var self = this;


    function savePushURL( userId, provider, deviceURL, callback ) {
        var updateObj = {
            _userId: ObjectId( userId ),
            provider: provider,
            deviceURL: deviceURL
        };

        Push
            .findOne( { _userId: userId } )
            .exec( function ( err, pushModel ) {
                if ( err ) {
                    return callback( err )
                }

                if (! pushModel ) {
                    pushModel = new Push( updateObj );
                } else {
                    pushModel.set( updateObj );
                }

                pushModel.save( function (err) {
                    if ( err ) {
                        return callback( err );
                    }

                    callback( null )
                })
            })
    }

    this.sendPush = function( userId, msg, callback ) {
        var options = {};
        Push
            .findOne( { _userId: userId })
            .exec( function( err, pushModel ) {
                var sendPushToProvider;
                if ( err ) {
                    return callback( err );
                }

                if ( ! pushModel ) {
                    err = new Error('Missing push URL');
                    err.status = 404;
                    return callback( err );
                }

                switch ( pushModel.provider ) {
                    case 'APPLE': {
                        sendPushToProvider = applePusher;
                    }
                        break;

                    default: {
                        err = new Error('Provider '+ pushModel.provider +' not implemented');
                        err.status = 400;
                        return callback( err );
                    }
                        break;
                }

                sendPushToProvider.sendPush( pushModel.deviceURL, msg, options );
                callback( null );

            } )
    };

    this.setPushURL = function( req, res, next ) {
        var userId = req.session.uId || "55545684a833ffac020895ec"; //todo remove or - this is test
        var body = req.body;

        savePushURL( userId, body.provider, body.deviceURL, function( err ) {
            if ( err ) {
                return next( err );
            }

            res.status( 201).send({ success: 'push URL saved/updated'})
        })
    };

    /*TODO REMOVE*/
    /*TEST*/

    this.testSendPush = function( req, res, next ) {
        var userId = ObjectId(req.params.id);
        var msg = req.body.msg;

        self.sendPush(userId, msg, function( err ) {
            if (err) {
                return next(err);
            }

            res.status(200).send({success: 'Push sended'});
        })
    }
};