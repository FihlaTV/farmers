define(['collections/base'], function (BaseCollection) {

    return {
        createMarketeersCollection: function () {
            var collection = new BaseCollection();

            collection.url = '/marketeers/marketeersList';

            return collection;
        },

        createCropCollection: function () {
            return new BaseCollection({url: '/cropList'});
        }
    }

});