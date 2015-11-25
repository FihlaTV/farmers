define(['text!templates/menu/leftMenuTemplate.html'],
    function (template) {

        var LeftMenuView = Backbone.View.extend({
            el      : '#leftMenuHolder',
            template: _.template(template),
            events  : {
                'click #profile': "openProfileDialog"
            },

            initialize: function () {

            },

            openProfileDialog: function (e) {
                alert('Open dialog!');
            },

            render: function () {
                var currentUser = App.user;
                this.$el.html(this.template({model: currentUser}));
            }
        });

        return LeftMenuView;
    });
