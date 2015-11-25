define([], function () {

    var Collection = Backbone.Collection.extend({

        initialize:function(url){
            this.url = function(){return url};
        }

    });

    return Collection;
});