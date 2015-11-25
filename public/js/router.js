define([
    'views/menu/leftMenu',
    'views/main/main',
    'views/login/loginView'
], function (LeftMenuView, MainView, LoginView) {

    var appRouter;
    appRouter = Backbone.Router.extend({

        routes: {
            "login"         : "login",
            "login?":"signUp",
            "cropList"      : "cropList",
            "marketeersList": "marketeersList",
            "*any"          : "any"
        },

        initialize: function () {
            //this.view = new MainView(App.authorized?'':new LoginView())
        },

        signUp:function(data){
            alert(data);
        },

        setView: function (path) {
            var self = this;
            self.view = new MainView();
            require([path], function (View) {
                var view = new View();
                self.view.render(view);
            });
        },

        cropList: function () {
            this.setView('views/crop/list')
        },

        marketeersList: function () {
            this.setView('views/marketeers/list')
        },

        any: function () {
            Backbone.history.navigate(App.authorized ? 'marketeers' : 'login', {trigger: true});
        },

        login: function () {
            this.setView('views/login/loginView')
        }

    });

    return appRouter;
});