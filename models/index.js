
module.exports = function(db){
    "use strict";

    require('./plant')(db);
    //require('./sessions')(db);
    require('./price')(db);
    require('./marketeer')(db);
    require('./user')(db);
    require('./admin')(db);
};