define(['models/base'], function (BaseModel) {

    var createMarketeer = function (options) {
        var baseModel = new BaseModel(options);
        baseModel.urlRoot = function () {
            return '/marketeers/marketeersList' + (this.id || '');
        };
        return baseModel;
    };

    return {createMarketeer: createMarketeer}

});