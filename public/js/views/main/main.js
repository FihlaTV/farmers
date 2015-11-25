define([
    'text!templates/main/main.html'
],function(template){

    var MainView = Backbone.View.extend({
        el:'#wrapper',
        template: _.template(template),

        render:function(){
            this.el.html(this.template)
        }
    });
    return MainView

});