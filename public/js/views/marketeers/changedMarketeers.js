define([],
    function () {
        var View = Backbone.View.extend({

            events: {
                'click .setMarketeer'   : 'setMarketeer',
                'click .blockUser'      : 'blockUser'
            },

            setMarketeer: function (e) {
                e.preventDefault();

                var $target = $(e.target);
                var userId = $target.attr('data-useId');

                this.onSetMarketeerSelected({userId: userId});
            },

            blockUser: function (e) {
                e.preventDefault();

                var $target = $(e.target);
                var userId = $target.attr('data-useId');

                this.onBlockChangeSelected({userId: userId});
            },

            onBlockChangeSelected  : function (args) {
            },
            onSetMarketeerSelected : function (args) {
            },

            initialize: function () {

            },

            render: function (data) {
                this.$el.html(this.template({
                    collection   : data
                }))
            }
        });
        return View;
    });