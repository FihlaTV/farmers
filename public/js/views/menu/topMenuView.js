/**
 * Created by andrey on 02.06.15.
 */

define([
    'text!templates/menu/topMenuTemplate.html'
], function (topMenuTemplate) {

    var View;
    View = Backbone.View.extend({
        el: '#nav-container',

        events: {
            'click #logOut'     : 'logout',
            'click .menuItem'   : 'changeTab'
        },

        topMenuAuthorized: [
            {
                name: "Taxonomy",
                url: "#taxonomy",
                title: "taxonomy"
            }, {
                name: "Lessons",
                url: "#lessons",
                title: "lessons"
            },{
                name: "Log out",
                url: "#logout",
                title: "logOut"
            }
        ],

        topMenuNOTAuthorized: [
            {
                name: "Log in",
                url: "#login",
                title: "LogIn"
            }
        ],

        initialize: function () {
            //this.listenTo(App.authorized, 'change', this.render());

            this.render();
        },

        changeTab: function(event) {
            var holder = $(event.target);
            var closestEl = holder.parent().parent();
            closestEl.find(".active").removeClass("active");
            holder.addClass("active");

        },

        logout: function () {
            $.ajax({
                url: "/admin/logOut",
                type: "GET",
                success: function () {
                    App.authorized = false;
                    App.router.navigate("login", {trigger: true});
                },
                error: function (err) {
                    alert(err);
                }
            });
        },

        render: function () {
            var authorized = App.authorized;
            var data;
            //if (authorized){
            //    data = {'topMenu': this.topMenuAuthorized}
            //} else {
            //    data = {'topMenu': this.topMenuNOTAuthorized}
            //}

            data = {'topMenu': this.topMenuAuthorized}
            this.$el.html(_.template(topMenuTemplate, data));


            return this;
        }
    });
    return View;
});