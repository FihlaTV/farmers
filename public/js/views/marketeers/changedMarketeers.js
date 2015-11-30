define([
        'text!templates/marketeers/userChangedMarketeerTemplate.html'
    ],
    function (template) {
        var View = Backbone.View.extend({
            template: _.template(template),
            events  : {
                'click .setMarketeer'      : 'setMarketeer',
                'click .blockUser'         : 'blockUser',
                'click .removeNotification': 'removeNotification',
            },

            //todo implement search

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

            removeNotification: function (e) {
                e.preventDefault();

                var $target = $(e.target);
                var notificationId = $target.attr('data-notificationId');

                this.onRemoveNotification({notificationId: notificationId});
            },

            onBlockChangeSelected : function (args) {
            },
            onSetMarketeerSelected: function (args) {
            },
            onRemoveNotification  : function (args) {
            },

            initialize: function () {

            },

            removeNotificationRow: function (notificationId) {

            },

            render: function (data) {
                this.$el.html(this.template({
                    collection: data
                }))
            }
        });
        return View;
    });