define([
    'views/menu/leftMenu',
    'views/login/loginView',
    'views/main/main'
], function (LeftMenuView, LoginView, MainView) {

    var appRouter;
    appRouter = Backbone.Router.extend({

        routes: {
            "login"         : "login",
            "cropList"      : "cropList",
            "marketeersList": "marketeersList",
            "*any"          : "any"
        },

        initialize: function () {
            this.view = App.authorized ? new MainView() : new LoginView();
            this.setView()
        },

        setView: function (path) {
            var self = this;

            require([path], function (View) {
                var view = new View();
                self.view.undelegateEvents();
                self.view = view;
                $('#wrapper').html(view.render().el);
                view.delegateEvents();
            });
        },

        cropList: function () {
            this.setView('views/crop/list')
        },

        marketeersList: function () {
            this.setView('views/marketeers/list')
        },

        any: function () {
            this.setView('views/marketeers/list')
        },

        login: function () {
            this.setView('views/login/loginView')
        }

    });

    return appRouter;
});