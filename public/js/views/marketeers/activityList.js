define([],
    function () {
        var View = Backbone.View.extend({

            events: {
                'click .acceptMarketeer': 'acceptMarketeer',
                'click .setMarketeer'   : 'setMarketeer',
                'click .linkMarketeer'  : 'linkMarketeerToExisting',
                'click .blockUser'      : 'blockUser'
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

            onNewMarketeerAccepted : function (args) {
            },
            onLinkMarketeerSelected: function (args) {
            },
            onBlockChangeSelected  : function (args) {
            },
            onSetMarketeerSelected : function (args) {
            },

            initialize: function () {

            },

            render: function (data) {
                this.$el.html(this.template({
                    newCollection   : data.newCollection,
                    changeCollection: data.changeCollection
                }))
            }
        });
        return View;
    });