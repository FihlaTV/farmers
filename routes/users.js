/**
 * Created by User on 27.04.2015.
 */

var express = require( 'express' );
var router = express.Router();
var UserHandler = require('../handlers/users');
var SessionHandler = require('../handlers/sessions');
var SchedulHandler = require('../handlers/schedule');

module.exports = function(db){

    var users = new UserHandler(db);
    var session = new SessionHandler(db);
    var schedule = new SchedulHandler(db);

    router.get('/',session.authenticatedUser, users.getUser);

    //router.get('/change', session.authenticatedUser, users.changeUserPlan);

    router.get('/settings', session.authenticatedUser, users.getUserSettings);
    router.post('/settings', session.authenticatedUser, users.addUserSettings);

    router.post('/affirmation/:id', session.authenticatedUser, users.addAffirmation);
    router.get('/affirmation/:id', session.authenticatedUser, users.getAffirmation);
    router.delete('/affirmation/:id', session.authenticatedUser, users.deleteAffirmation);

    router.get('/visualisation/:id', session.authenticatedUser, users.getVisualisation);
    router.post('/visualisation/:id', session.authenticatedUser, users.addVisualisation);
    router.delete('/visualisation/:id', session.authenticatedUser, users.deleteVisualisation);

    router.post('/blockLesson', session.authenticatedUser, users.blockLesson);

    router.post('/signIn', users.signInClient );
    router.get('/signOut', users.signOut );

    router.get('/history', session.authenticatedUser, users.getHistory);
    //router.post('/:aId', session.authenticatedUser, users.updateAffirmation);

    /*TODO remove*/


    router.get('/testPlan', session.authenticatedUser, users.testPlan);
    router.get('/plan', session.authenticatedUser, users.makePLan);
    router.get('/getPlan', session.authenticatedUser, users.getPlan);

    router.post('/save', session.authenticatedUser, schedule.getMsg);

    return router;
};
