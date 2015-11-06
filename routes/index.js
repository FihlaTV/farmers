module.exports = function(app, db){
    var logWriter = require('../modules/logWriter')();
    var models = require('../models/index')(db);
    var cropsRouter = require('./crops')(db);
    var notificationsRouter = require('./notifications')(db);
    var usersRouter = require('./users')(db);
    var marketeersRouter = require('./marketeers')(db);
    var adminRouter = require('./admin')(db);
    var pricesRouter = require('./prices')(db);
    var importRouter = require('./import')(db);


    app.get('/', function(req, res, next){
        res.status(200).send( 'Express start succeed' );
    });

    app.use('/crops', cropsRouter);
    app.use('/notifications', notificationsRouter);
    app.use('/users', usersRouter);
    app.use('/marketeers', marketeersRouter);
    app.use('/admin', adminRouter);
    app.use('/prices', pricesRouter);
    app.use('/importFromCsv', importRouter);




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