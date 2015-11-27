define([
    'router',
    'communication',
    'custom'
], function (Router, Communication, Custom) {

    // start application
    var initialize = function () {
        var appRouter;

        App.authorized = false;

        appRouter = new Router();
        App.router = appRouter;

        Backbone.history.start({silent: true});

        Communication.checkLogin(Custom.runApplication);

    };
    return {
        initialize: initialize
    }
});