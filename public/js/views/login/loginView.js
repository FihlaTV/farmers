define([
    'text!templates/login/loginTemplate.html'
], function (LoginTemplate) {

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
                url     : "/admin/signIn",
                type    : "POST",
                dataType: 'json',
                data    : {
                    login: username,
                    pass : password
                },
                success : function (response) {
                    App.authorized = true;
                    App.currentUser = response;
                    Backbone.history.navigate('marketeers', {trigger: true});
                },
                error   : function (err) {
                    App.authorized = false;
                    errorHolder.text(err.responseText);
                    errorHolder.addClass('error');

                }
            });

            return this;
        },

        render: function () {
            this.$el.html(_.template(LoginTemplate));
            this.$errorHolder = this.$el.find('#errorHolder');

            return this;
        }

    });

    return View;

});
