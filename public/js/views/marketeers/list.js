define([],
    function () {
        var View = Backbone.View.extend({

            events: {},

            initialize: function () {

            },

            onCreateMarketeer: function (args) {
            },
            onEditMarketeer  : function (args) {
            },
            onDeleteMarketeer: function (args) {
            },

            addMarketeerRow: function (marketeer) {

            },

            removeMarketeerRow: function (marketeerId) {
                this.$el.find('#' + marketeerId).remove();
            },

            render: function (data) {
                this.$el.html({collection:data})
            }

        });

        return View;
    });