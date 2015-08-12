/**
 * Created by andrey on 02.06.15.
 */

define([
    'models/taxonomyModel'
], function (TaxonomyModel) {
    var Collection = Backbone.Collection.extend({
        model: TaxonomyModel,

        url: function () {
            return "/taxonomy"
        },

        initialize: function(){
            this.fetch({
                reset: true,
                success: function(models){
                },
                error: function(xhr, text){
                }
            });
        }
    });

    return Collection;
});