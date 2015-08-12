/**
 * Created by eriy on 08.05.2015.
 */
define([
    'views/menu/topMenuView'
], function (TopMenuView) {

    var appRouter;
    appRouter = Backbone.Router.extend({

        wrapperView: null,
        topBarView: null,
        view: null,

        routes: {
            "login"                     :  "login",
            "taxonomy"                  :  "taxonomy",
            "lessons"                   :  "lessons",
            "*any"                      :  "any"
        },

        initialize: function () {
                new TopMenuView();
        },

        loadWrapperView: function (name, params) {
            var self = this;
            i/*f(!App.authorized){
                if (name === 'taxonomy' || name === 'lessons') {
                    return Backbone.history.navigate("login", {trigger: true});
                }
            } else {*/
                if (name === 'login') {
                    return Backbone.history.navigate("taxonomy", {trigger: true});
                }
            //}

            require(['views/' + name + '/' + name + 'View'], function (View) {
                if (!self[name + 'View']) {
                    self[name + 'View'] = new View();
                }
                self.changeWrapperView(self[name + 'View'], params);
            });
        },

        changeWrapperView: function (wrapperView, params) {
            if (this.wrapperView) {
                this.wrapperView.undelegateEvents();
                $('#wrapper').html('');
            }

            $('#wrapper').html(wrapperView.el);
            wrapperView.delegateEvents();

            this.wrapperView = wrapperView;

            if (wrapperView.afterUpend) {
                wrapperView.afterUpend();
            }

            if (wrapperView.setParams) {
                wrapperView.setParams(params);
            }
        },

        taxonomy: function () {
            this.loadWrapperView('taxonomy');
        },

        lessons: function () {
            this.loadWrapperView('lessons');
        },

        any: function () {
            this.loadWrapperView('taxonomy');
        },

        login: function () {
            this.loadWrapperView('login');
        }


    });

    return appRouter;
});