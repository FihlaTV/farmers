/**
 * Created by eriy on 27.05.2015.
 */


var express = require( 'express' );
var router = express.Router();
var TaxonomyHandler = require('../handlers/taxonomy');
var UserHandler = require('../handlers/users');
var ScheduleHandler = require('../handlers/schedule');
var LessonHandler = require('../handlers/lessons');
var PushHandler = require('../handlers/pushes');

module.exports = function(db){
    var Taxonomy = new TaxonomyHandler( db );
    var users = new UserHandler( db );
    var Lesson = new LessonHandler( db );
    var Schedule = new ScheduleHandler( db );
    var Push = new PushHandler( db );

    router.get('/taxonomy/add', Taxonomy.testCreateTaxonomies );
    router.get('/lesson/add', Lesson.testAddLessons );

    router.get('/user/add', users.createUserTest);
    router.get('/plan/add/:id', users.createPlanTest);
    router.get('/history/add/:id', users.createHistoryTest);

    router.post('/push/send/:id', Push.testSendPush );

    return router;
};