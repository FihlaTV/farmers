define([
    'text!templates/marketeers/marketeersTemplate.html',
    'collections/collectionsFactory',
    'models/modelsFactory',
    'views/marketeers/list',
    'views/marketeers/activityList',
    'views/marketeers/details',
    'views/search/tableSearchView'
], function (template, collectionsFactory, modelsFactory, MarketeersListView, ActivityListView, DetailsView, TableSearchView) {
    var View = Backbone.View.extend({
        //region Initialization

        template: _.template(template),

        initialize: function () {
            var self = this;
            this.marketeersCollection = collectionsFactory.createMarketeersCollection();

            //  this.activityListView = new ActivityListView()

        },

        //endregion

        //region Ui Events

        events: {
            'click .tabButton': "changeTab",
            'click #addButton': "addMarketeer"
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

        },

        addMarketeer: function (e) {
            e.preventDefault();
            this.openMarketeersDetailsDialog({title: 'Add Marketeer'})
        },

        //endregion

        //region Methods

        initializeMarketeersListAndCollection: function (collectionData) {
            var self = this;

            collectionData = collectionData || this.marketeersCollection.toJSON();

            this.marketeersCollection.on('reset', this.marketeersCollectionReseted, this);
            this.marketeersCollection.on('add', this.marketeersCollectionModelAdded, this);
            this.marketeersCollection.on('remove', this.marketeersCollectionModelRemoved, this);
            this.marketeersCollection.on('change', this.marketeersCollectionChanged, this);

            this.marketeersListView.render(collectionData);
            this.marketeersListView.onEditMarketeer = function (args) {
                var id = args.id;
                var marketeer = self.marketeersCollection.get(id);
                self.openMarketeersDetailsDialog({jsonModel: marketeer.toJSON(), title: 'Edit Marketeer'});
            };

            this.marketeersSearch = new TableSearchView({
                el       : '#marketeersSearchContainer',
                dataArray: this.marketeersCollection.toJSON()
            });
            this.marketeersSearch.onSearchChanged = function (args) {
                self.marketeersListView.toggleRows(args.jquerySearchStringToHide);
            };
            this.marketeersSearch.render();

            this.marketeersListView.onDeleteMarketeer = function (args) {
                var id = args.id;
                var marketeer = self.marketeersCollection.get(id);

                marketeer.destroy({
                    success: function () {
                        self.marketeersCollection.remove(id);
                        self.marketeersListView.removeMarketeerRow(id);
                    },
                    err    : function (err) {
                        alert(err);
                    }
                });

            }
        },

        openMarketeersDetailsDialog: function (options) {
            var self = this;
            var detailsView = new DetailsView();

            detailsView.onSave = function (data) {
                var marketeersModel = data.id ? self.marketeersCollection.get(data.id) : modelsFactory.createMarketeer(data);

                marketeersModel.save(data, {
                    wait   : true,
                    success: function (data) {
                        marketeersModel.id = data.id;
                        self.marketeersCollection.add(marketeersModel, {merge: true});
                        detailsView.hideDialog();
                    },
                    error  : function (err) {
                        alert(err);
                    }
                });
            };
            detailsView.render(options);
        },

        //endregion

        //region Collection Handlers

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

        marketeersCollectionChanged: function (args) {

        },

        //endregion

        //region Render

        render: function () {
            var data;
            var self = this;
            this.$el.html(this.template());
            this.marketeersListView = new MarketeersListView({el: '#marketeersTable'});
            this.marketeersCollection.fetch({
                success: function (data) {
                    self.initializeMarketeersListAndCollection(data.toJSON());
                }
            });

            this.$previousTab = this.$el.find('.tabButton.selected');
            data = this.$previousTab.attr('data-content');
            this.$previousContent = this.$el.find('#' + data);
            this.$previousContent.show();

        }

        //endregion
    });
    return View;

})
;