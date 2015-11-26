define([], function () {

    var Collection = Backbone.Collection.extend({

        initialize:function(options){
            this.url = function(){return options.url};
        }

    });

    return Collection;
});