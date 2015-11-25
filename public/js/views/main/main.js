define([
    'text!templates/main/main.html'
], function (template) {

    var MainView = Backbone.View.extend({
        el      : '#wrapper',
        template: _.template(template),

        initialize: function (contentView) {

        },

        render: function (contentView) {
            var template = this.template();
            this.$el.html(template);
            contentView.render(this.$el.find('#contentHolder'));
            contentView.delegateEvents();
            // this.setContent(this.contentView);
        },

        setContent: function (view) {
            //this.contentView.undelegateEvents();
            //this.contentView = view;
            //this.contentView.render();

        }

    });
    return MainView

});