/**
 * Created by eriy on 14.05.2015.
 */

var express = require( 'express' );
var router = express.Router();
var TaxonomyHandler = require('../handlers/taxonomy');
var SessionHandler = require('../handlers/sessions');

module.exports = function(db){

    var taxonomy = new TaxonomyHandler(db);
    var session = new SessionHandler(db);

    router.get('/:name', /*session.authenticatedUser, session.isAdmin,*/ taxonomy.getTaxonomy );
    router.get('/', /*session.authenticatedUser, session.isAdmin,*/ taxonomy.getTaxonomy );
    router.get('/value/:id', taxonomy.getValue);
    router.post('/value/:name', /*session.authenticatedUser, session.isAdmin,*/ taxonomy.addNewValue );
    router.post('/', /*session.authenticatedUser, session.isAdmin,*/ taxonomy.createTaxonomy );
    router.put('/value/:id', /*session.authenticatedUser, session.isAdmin,*/ taxonomy.updateValue );
    router.put('/:name', /*session.authenticatedUser, session.isAdmin,*/ taxonomy.updateTaxonomy );
    router.delete('/value/:id', /*session.authenticatedUser, session.isAdmin,*/ taxonomy.deleteValue );
    router.delete('/:name', /*session.authenticatedUser, session.isAdmin,*/ taxonomy.deleteTaxonomy );

    return router;
};