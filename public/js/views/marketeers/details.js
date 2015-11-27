define(['text!templates/marketeers/detailsTemplate.html'],
    function (template) {
        var View = Backbone.View.extend({
            el      : '#dialogHolder',
            template: _.template(template),
            events  : {
                'click #saveButton'  : 'saveItem',
                'click #cancelButton': 'cancel'
            },

            initialize: function () {

            },

            onSave: function (model) {

            },

            cancel: function (e) {
                e.preventDefault();
                this.onCancel();
            },

            onCancel: function () {
                this.$el.removeClass('dialog');
                setTimeout(this.hideDialog, 1000);
            },

            hideDialog: function () {
                $('#dialogContent').remove();
            },

            saveItem: function (e) {
                e.preventDefault();

                var $el = this.$el;
                var name = $el.find('name').val();
                var location = $el.find('location').val();

                this.onSave({name: name, location: location});
            },

            render: function (options) {
                var model = options.jsonModel || {};
                var title = options.title;
                var readonly = options.readonly || {};
                var formString = this.template({
                    model   : model,
                    readonly: readonly,
                    title   : title
                });

                this.$el.html(formString);
                this.$el.addClass('dialog');

            }
        });

        return View;
    });