define([
        'text!templates/marketeers/listTemplate',
        'text!templates/marketeers/listItemTemplate'

    ],
    function (listTemplate, listItemTemplate) {
        var View = Backbone.View.extend({

            template    : _.template(listTemplate),
            itemTemplate: _.template(listItemTemplate),

            events: {
                'click .editMarketeer'  : "editMarketeerClicked",
                'click .deleteMarketeer': 'deleteMarketeerClicked'
            },

            initialize: function () {

            },

            editMarketeerClicked: function (e) {
                e.preventDefault();
                var id = $(e.target).attr('data-id');
                this.onEditMarketeer({id: id});
            },

            deleteMarketeerClicked: function (e) {
                e.preventDefault();
                var id = $(e.target).attr('data-id');
                this.onDeleteMarketeer({id: id});
            },

            onEditMarketeer  : function (args) {
            },
            onDeleteMarketeer: function (args) {
            },

            addMarketeerRow: function (marketeer) {
                this.$el.prepend(this.itemTemplate({model: marketeer}));
            },

            removeMarketeerRow: function (marketeerId) {
                this.$el.find('#' + marketeerId).remove();
            },

            render: function (data) {
                this.$el.html(this.template({collection: data}))
            }

        });

        return View;
    });