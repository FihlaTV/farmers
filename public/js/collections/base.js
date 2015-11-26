define(['models/base'], function (BaseModel) {
    var Collection = Backbone.Collection.extend({

        model: BaseModel,
        parse: function (response) {
            return response.data;
        }
    });

    return Collection;
});