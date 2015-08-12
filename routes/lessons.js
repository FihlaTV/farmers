/**
 * Created by User on 28.04.2015.
 */

var express = require( 'express' );
var router = express.Router();
var LessonHandler = require('../handlers/lessons');

module.exports = function(db){
    var lesson = new LessonHandler(db);

    router.post('/', lesson.addLesson);
    router.get('/:id?', lesson.getLessons);
    router.delete('/:id', lesson.deleteLesson);
    router.put('/:id', lesson.addLesson);

    /*router.put('/updateValue/:id', lesson.updateLessonValue);
    router.put('/updateText/:id', lesson.updateLessonText);*/
    /*router.put('/:lId', lesson.updateLesson);
    router.delete('/:lId', lesson.deleteLesson);
    router.get('/taxonomies', lesson.getAllTaxonomies);
    router.get('/themes/:tax', lesson.getAllThemes);
    router.get('/random', lesson.getLesson);*/

    return router;
};