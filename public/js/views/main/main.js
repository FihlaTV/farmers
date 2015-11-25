define([
    'text!templates/main/main.html'
], function (template) {

    var MainView = Backbone.View.extend({
        el      : '#wrapper',
        template: _.template(template),

        initialize: function (contentView) {

        },

        createView:function(View,selector){
            var view = new View({el:selector});
            view.render();
            view.delegateEvents();

        },

        render: function (options) {

            var ContentView;
            var MenuView;
            var template = this.template();
            this.$el.html(template);

            MenuView = options.MenuView;
            ContentView = options.ContentView;

            if (MenuView) {
                this.createView(MenuView, '#leftMenuHolder')
            }

            if (ContentView) {
                this.createView(ContentView, '#contentHolder')
            }

        }


    });
    return MainView

});