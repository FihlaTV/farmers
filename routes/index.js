/**
 * Created by User on 27.04.2015.
 */
module.exports = function(app, db){
    var logWriter = require('../modules/logWriter')();
    var models = require('../models/index')(db);
    var usersRouter = require('./users')(db);
    var lessonsRouter = require('./lessons')(db);
    var questionsRouter = require('./questions')(db);
    var adminRouter = require('./admin')(db);
    var taxonomyRouter = require('./taxonomys')(db);
    var pushRouter = require('./pushes')(db);
    var testRouter = require('./test')(db);

    /*var Test = require( '../handlers/schedule' );
    var test0 = new Test(db);*/


    app.get('/', function(req, res, next){
        res.status(200).send( 'Express start succeed' );
    });

    app.use('/user', usersRouter);
    app.use('/lesson', lessonsRouter);
    app.use('/question', questionsRouter);
    app.use('/admin', adminRouter );
    app.use('/taxonomy', taxonomyRouter );
    app.use('/test', testRouter );
    app.use('/push', pushRouter );

    /*app.post('/test', function(req,res,next) {
        test0.startMainCron();
        res.status(200).send();
    });*/

    /*app.get('/test', function (req, res, next) {
        res.status(200).send(test0.getJobs())
    });*/

    /*app.delete('/test/:id', function (req, res, next) {
        test0.deleteJob( req.params.id );
        res.status(200).send(test0.getJobs())
    });*/

    function notFound(req, res, next){
        next();
    }

    function errorHandler( err, req, res, next ) {
        var status = err.status || 500;

        if( process.env.NODE_ENV === 'production' ) {
            if(status === 404 || status === 401){
                logWriter.log( '', err.message + '\n' + err.stack );
            }
            res.status( status );
        } else {
            if(status !== 401) {
                logWriter.log( '', err.message + '\n' + err.stack );
            }
            res.status( status ).send( err.message + '\n' + err.stack );
        }

        if(status === 401){
            console.warn( err.message );
        } else {
            console.error(err.message);
            console.error(err.stack);
        }
    }
    app.use( notFound );
    app.use( errorHandler );
};