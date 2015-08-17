var express = require( 'express' );
var router = express.Router();
var ImportHandler = require('../handlers/import');

module.exports = function(db){
    var importHandler = new ImportHandler(db);

    router.get('/', importHandler.importFromCsv);

    return router;
};
