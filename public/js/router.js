define([
    'views/menu/leftMenu',
    'views/main/main'
], function (LeftMenuView, MainView) {

    var appRouter;
    appRouter = Backbone.Router.extend({

        routes: {
            "login": "login",

            "cropList"  : "cropList",
            "marketeers": "goToMarketeers",
            "*any"      : "any"
        },

        initialize: function () {
            //this.view = new MainView(App.authorized?'':new LoginView())
        },

        setView: function (paths) {
            var self = this;
            self.view = new MainView();
            require(paths, function (ContentView, MenuView) {
                self.view.render({ContentView: ContentView, MenuView: MenuView});
            });
        },

        cropList: function () {
            this.setView('views/crop/list')
        },

        goToMarketeers: function () {
            this.setView(['views/marketeers/tab', 'views/menu/leftMenu'])
        },

        any: function () {
            Backbone.history.navigate(App.authorized ? 'marketeers' : 'login', {trigger: true});
        },

        login: function () {
            this.setView(['views/login/loginView'])
        }

    });

    return appRouter;
});