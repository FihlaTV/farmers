define(['collections/base'], function (BaseCollection) {

    return {
        createMarketeersCollection: function () {
            var collection = new Backbone.Collection();
            collection.parse=function(data){
                //for debug
                return data;
            };
            collection.url = '/marketeers';
            return collection;
        },

        createCropCollection: function () {
            return new BaseCollection({url:'/cropList'});
        }
    }

});