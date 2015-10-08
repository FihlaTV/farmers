
module.exports = function(db){
    "use strict";

    require('./plant')(db);
    require('./crop')(db);
    //require('./sessions')(db);
    require('./price')(db);
    require('./parsedBody')(db);
    require('./marketeer')(db);
    require('./newMarketeer')(db);
    require('./user')(db);
    require('./admin')(db);
};