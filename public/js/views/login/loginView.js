define([
    'text!templates/login/loginTemplate.html',
    'custom'
    //'validation'
], function (LoginTemplate, Custom /*, validation*/) {

    var View = Backbone.View.extend({

        initialize: function () {
        },

        events: {
            "submit #loginForm": "login"
        },

        login: function (e) {
            e.preventDefault();
            var $el = this.$el;
            var username = $el.find("#userName").val().trim();
            var password = $el.find("#pass").val().trim();
            var errorHolder = this.$errorHolder;

            $.ajax({
                url     : "/login",
                type    : "POST",
                dataType: 'json',
                data    : {
                    login: username,
                    pass : password
                },
                success : function (response) {
                    App.authorized = true;
                    App.currentUser = response.data;

                },
                error   : function (err) {
                    App.authorized = false;
                    errorHolder.text(err.responseText);
                }
            });

            return this;
        },

        render: function ($el) {
            this.$el = $el;

            $el.html(_.template(LoginTemplate));
            this.$errorHolder = $el.find('#errorHolder');

            return this;
        }

    });

    return View;

});
