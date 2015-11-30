define([],
    function () {
        var View = Backbone.View.extend({

            events: {
                'click .acceptMarketeer': 'acceptMarketeer',
                'click .linkMarketeer'  : 'linkMarketeerToExisting'
            },

            acceptMarketeer: function (e) {
                e.preventDefault();

                var $target = $(e.target);
                var userId = $target.attr('data-useId');
                var notificationId = $target.attr('data-notificationId');
                var newMarketeerName = $target.attr('data-marketeerName');

                this.onNewMarketeerAccepted({
                    userId        : userId,
                    notificationId: notificationId,
                    marketeerName : newMarketeerName
                });
            },

            linkMarketeerToExisting: function (e) {
                e.preventDefault();

                var $target = $(e.target);
                var userId = $target.attr('data-useId');
                var notificationId = $target.attr('data-notificationId');

                this.onLinkMarketeerSelected({
                    userId        : userId,
                    notificationId: notificationId
                });
            },

            onNewMarketeerAccepted : function (args) {
            },
            onLinkMarketeerSelected: function (args) {
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