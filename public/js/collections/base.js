define([], function () {

    var Collection = Backbone.Collection.extend({

        parse      : function (response) {
            //for debug
            return response.data;
        },
        idAttribute: "_id"

    });

    return Collection;
});