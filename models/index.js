
module.exports = function(db){
    "use strict";

    require('./crop')(db);
    //require('./sessions')(db);
    require('./pricesCacheTable')(db);
    require('./monthAveragePrice')(db);
    require('./price')(db);
    require('./parsedBody')(db);
    require('./marketeer')(db);
    require('./notification')(db);
    require('./user')(db);
    require('./admin')(db);
};