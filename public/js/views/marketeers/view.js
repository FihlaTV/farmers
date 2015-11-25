define([
    'text!templates/marketeers/marketeersTemplate.html',
    'collections/collectionFactory',
    'models/modelsFactory',
    'views/marketeers/list',
    'views/marketeers/activityList',
    'views/marketeers/details'
], function (template, CollectionFactory, modelsFactory, MarketeersListView, ActivityListView, DetailsView) {
    var View = Backbone.View.extend({

        template   : _.template(template),
        dataContent: "marketeers",

        events: {
            'click .tabButton': "changeTab"
        },

        initialize: function () {
            this.marketeersCollection = collectionFactory.createMarketeersCollection();
            this.marketeersListView = new MarketeersListView();
            this.activityListView = new ActivityListView()

        },

        initializeMarketeersListAndCollection: function () {
            var self = this;

            this.marketeersCollection.on('reset', this.marketeersCollectionReseted, this);
            this.marketeersCollection.on('add', this.marketeersCollectionModelAdded, this);
            this.marketeersCollection.on('remove', this.marketeersCollectionModelRemove, this);

            this.marketeersListView.onCreateMarketeer = function (args) {
                var detailsView = new DetailsView();
                detailsView.onSave = function (data) {
                    var marketeersModel = modelsFactory.createMarketeer(data);
                    marketeersModel.save({
                        wait   : true,
                        success: function (data) {
                            marketeersModel.id = data.id;
                            self.marketeersCollection.add(marketeersModel);
                            detailsView.hideDialog();
                        },
                        error  : function (err) {
                            alert(err);
                        }
                    });
                }
            };

            this.marketeersListView.onDeleteMarketeer = function (args) {
                var id = args.id;
                self.marketeersCollection.remove(id);
            }
        },

        marketeersCollectionReseted: function (args) {
            var data = this.marketeersCollection.toJSON();
            this.marketeersListView.render(data);
        },

        marketeersCollectionModelAdded: function (args) {
            this.marketeersListView.addMarketeerRow(args.model);
        },

        marketeersCollectionModelRemoved: function (args) {
            this.marketeersListView.removeMarketeerRow(args.model.id);
        },

        changeTab: function (e) {
            e.preventDefault();

            var target = $(e.target);
            var data = target.attr('data-content');

            this.$previousTab.toggleClass('selected');
            this.$previousTab = target;
            this.$previousTab.toggleClass('selected');

            this.$previousContent.hide();
            this.$previousContent = this.$el.find('#' + data);
            this.$previousContent.show();

        }

        ,

        render: function () {
            var data;

            this.$el.html(this.template());
            this.$previousTab = this.$el.find('.tabButton.selected');
            data = this.$previousTab.attr('data-content');
            this.$previousContent = this.$el.find('#' + data);
            this.$previousContent.show();

        }
    });
    return View;

})
;