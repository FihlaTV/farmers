define([
    'views/menu/leftMenu',
    'views/main/main'
], function (LeftMenuView, MainView) {

    var appRouter;
    appRouter = Backbone.Router.extend({

        routes: {
            "login"     : "login",
            "cropList"  : "cropList",
            "marketeers": "goToMarketeers",
            "logout"    : "logout"
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
            if (App.authorized) {
                this.setView(['views/marketeers/view', 'views/menu/leftMenu'])
            }
            else {
                Backbone.history.navigate('login', {trigger: true});
            }
        },

        any: function () {
            Backbone.history.navigate(App.authorized ? 'marketeers' : 'login', {trigger: true});
        },

        login: function () {

            if (App.authorized) {
                Backbone.history.navigate('marketeers', {trigger: true});
            } else {
                this.setView(['views/login/loginView'])
            }
        },

        logout: function () {
            $.post('/admin/signOut', function (data, status) {
                if (data.success) {
                    App.authorized = false;
                    delete App.currentUser;
                    Backbone.history.navigate('login', {trigger: true});
                } else {
                    alert(data.error);
                }
            })
        }

    });

    return appRouter;
});