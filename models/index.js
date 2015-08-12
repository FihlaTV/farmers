
module.exports = function(db){
    "use strict";

    require('./vegetable')(db);
    //require('./sessions')(db);
    require('./price')(db);
};