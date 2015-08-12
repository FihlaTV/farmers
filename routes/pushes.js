/**
 * Created by eriy on 19.05.2015.
 */

var express = require( 'express' );
var router = express.Router();
var PushHandler = require('../handlers/pushes');
var SessionHandler = require('../handlers/sessions');

module.exports = function(db){

    var push = new PushHandler(db);
    var session = new SessionHandler(db);

    router.post('/pushURL', /*session.authenticatedUser,*/ push.setPushURL );

    return router;
};