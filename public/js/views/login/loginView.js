/**
 * Created by andrey on 02.06.15.
 */

define([
    'text!templates/login/loginTemplate.html',
    'custom'
    //'validation'
], function (LoginTemplate, Custom /*, validation*/) {

    var View;
    View = Backbone.View.extend({

        id: 'login',

        initialize: function () {
            this.setDefaultData();

            this.listenTo(this.stateModel, 'change', this.render);

            this.render();
        },

        events: {
            "click .login-button": "login"
        },

        //reset the data
        setDefaultData: function () {
            var defaultData = {
                password    :   '',
                user        :   '',
                message     :   false

            };

            if (this.stateModel) {
                this.stateModel.set(defaultData);
            } else {
                this.stateModel = new Backbone.Model(defaultData);
            }
        },

        afterUpend: function () {
            this.setDefaultData();
            this.render();
        },

        login: function (event) {
            event.stopImmediatePropagation();
            event.preventDefault();

            var self = this;

            var stateModelUpdate = {
                user: this.$el.find("#userName").val().trim(),
                password: this.$el.find("#pass").val().trim()
            };

            this.stateModel.set(stateModelUpdate);

            $.ajax({
                url: "/admin/logIn",
                type: "POST",
                dataType: 'json',
                data: {
                    login: stateModelUpdate.user,
                    pass: stateModelUpdate.password
                },
                success: function (response) {
                    App.authorized = true;
                    App.router.navigate("taxonomy", {trigger: true});
                    self.stateModel.set({
                        password: ''
                    });
                },
                error: function (err) {
                    App.authorized = false;
                    self.stateModel.set({
                        password: null,
                        authorized: false,
                        message: 'Wrong login or password'
                    });
                }
            });
            return this;
        },

        render: function () {
            this.$el.html(_.template(LoginTemplate, this.stateModel.toJSON()));
            return this;
        }

    });

    return View;

});
