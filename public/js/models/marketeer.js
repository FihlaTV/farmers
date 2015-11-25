define([], function () {
    var Model = Backbone.Model.extend({
        idAttribute: '_id',
        defaults:{
            name:'',
            location:''
        },

        urlRoot:function(){
            return "/"
        }


    });
    return Model;
});