/**
 * Created by User on 02.06.2015.
 */


define(['models/lessonsModel'], function(LessonsModel){

    var Collection = Backbone.Collection.extend({
        model: LessonsModel,

        url: function(){
            return '/lesson';
        },

        initialize: function(){
            this.fetch({
                reset: true,
                success: function(models){
                    console.log(models)
                },
                error: function(xhr, text){
                    console.dir(xhr);
                    console.log(text);
                }
            });
        }
    });


    return Collection;
});