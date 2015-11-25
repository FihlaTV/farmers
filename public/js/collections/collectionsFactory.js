define(['collections/base'], function (BaseCollection) {

    return {
        createMarketeersCollection: function () {
            return new BaseCollection('/marketeers')
        },

        createCropCollection: function () {
            return new BaseCollection('/cropList');
        }
    }

});