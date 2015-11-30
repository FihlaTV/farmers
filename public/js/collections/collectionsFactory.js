define(['collections/base'], function (BaseCollection) {

    return {
        createMarketeersCollection: function () {
            var collection = new BaseCollection();

            collection.url = '/marketeers/marketeersList';

            return collection;
        },

        createUserActivityNewMarketeersCollection: function () {
            var collection = new BaseCollection();

            collection.url = '/notifications/newMarketeer';

            return collection;
        },

        createUserActivityChangeMarketeersCollection: function () {
            var collection = new BaseCollection();

            collection.url = '/notifications/changeMarketeer';

            return collection;
        },

        createCropCollection: function () {
            return new BaseCollection({url: '/cropList'});
        }
    }

});