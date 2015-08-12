/**
 * Created by User on 27.04.2015.
 */
module.exports = function(db){
    "use strict";

    require('./user')(db);
    require('./sessions')(db);
    require('./lesson')(db);
    require('./plan')(db);
    require('./questions')(db);
    require('./answers')(db);
    require('./taxonomys')(db);
    require('./push')(db);
    require('./msgHistory')(db);
    require('./admin')(db);
};