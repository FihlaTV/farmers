define(['models/base'], function (BaseModel) {

    var createMarketeer = function (options) {
        var baseModel = new BaseModel(options);
        baseModel.urlRoot = function () {
            return '/marketeers/' + this.id;
        }
    };

    return {createMarketeer: createMarketeer}

});