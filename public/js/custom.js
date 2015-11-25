define([],function () {
    var runApplication = function (err, data) {
        var url;
        url =  Backbone.history.fragment || Backbone.history.getFragment();

        if (url === "") {
            url = 'marketeers';
        }

        if (Backbone.history.fragment) {
            Backbone.history.fragment = '';
        }

        if (!err) {
            App.authorized = true;
            App.currentUser=data;
            return Backbone.history.navigate(url, {trigger: true});
        } else {
            App.authorized = false;
            return Backbone.history.navigate(url, {trigger: true});
        }

    };


    return {
        runApplication: runApplication
    };
});
