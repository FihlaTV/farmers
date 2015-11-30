define([
    'text!templates/marketeers/marketeersTemplate.html',
    'collections/collectionsFactory',
    'models/modelsFactory',
    'views/marketeers/list',
    'views/marketeers/details',
    'views/search/tableSearchView',
    'views/marketeers/addedMarketeers',
    'views/marketeers/changedMarketeers'

], function (template, collectionsFactory, modelsFactory, MarketeersListView, DetailsView, TableSearchView, AddedMarketeersView, ChangedMarketeersView) {
    var View = Backbone.View.extend({
        //region Initialization

        template: _.template(template),

        initialize: function () {
            var self = this;

            this.marketeersCollection = collectionsFactory.createMarketeersCollection();
            this.changeMarketeersCollection = collectionsFactory.createUserActivityChangeMarketeersCollection();
            this.newMarketeersCollection = collectionsFactory.createUserActivityNewMarketeersCollection();
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
            this.changeTabInternal(target.parent('div'));
        },

        addMarketeer: function (e) {
            e.preventDefault();
            e.stopPropagation();

            this.changeTabInternal($(e.target).parent('div'));
            this.openMarketeersDetailsDialog({title: 'Add Marketeer'})
        },

        //endregion

        //region Methods

        changeTabInternal: function (element) {
            var data = element.attr('data-content');

            this.$previousTab.toggleClass('selected');
            this.$previousTab = element;
            this.$previousTab.toggleClass('selected');

            this.$previousContent.hide();
            this.$previousContent = this.$el.find('#' + data);
            this.$previousContent.show();
        },

        initializeMarketeersTab: function (collectionData) {
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

            //todo move search to marketeers list view

            this.marketeersSearch = new TableSearchView({
                el       : '#marketeersSearchContainer',
                dataArray: this.marketeersCollection.toJSON()
            });
            this.marketeersSearch.onSearchChanged = function (args) {
                self.marketeersListView.showAllRows();
                self.marketeersListView.hideRows(args.selector);
            };
            this.marketeersSearch.render();

            this.marketeersListView.onDeleteMarketeer = function (args) {
                var id = args.id;
                var marketeer = self.marketeersCollection.get(id);
                var cancel = !confirm('Delete marketeer: ' + marketeer.attributes.fullName + '?');

                if (cancel) {
                    return;
                }

                marketeer.destroy({
                    success: function () {
                        self.marketeersCollection.remove(id);
                    },
                    err    : function (err) {
                        alert(err);
                    }
                });
            }
        },

        initializeAddedMarketeersView: function (jsonData) {
            this.newMarketeersCollection.on('remove', this.newMarketeersCollectionModelRemoved, this);
            this.addedMarketeersView.render(jsonData);

            this.addedMarketeersView.onNewMarketeerAccepted = function (args) {
                //todo create new marketeer by dialog
                //todo set marketeer to user
                //todo remove notification
            };

            this.changedMarketeersView.onLinkMarketeerSelected = function (args) {
                //todo open Marketeers dialog
                //todo set marketeer to uset
                //todo remove notification
            };
        },

        initializeChangedMarketeersView: function (jsonData) {
            this.changeMarketeersCollection.on('remove', this.changeMarketeersCollectionModelRemoved, this);
            this.changedMarketeersView.render(jsonData);

            this.changedMarketeersView.onBlockChangeSelected = function (args) {
                //todo block user from changing marketeer
            };

            this.changedMarketeersView.onSetMarketeerSelected = function (args) {
                //todo open Marketeers dialog
                //todo set marketeer to uset
            };

            this.changedMarketeersView.onRemoveNotification = function (args) {
                //todo remove notification from collection
            };
        },

        openMarketeersDetailsDialog: function (options) {
            var self = this;
            var detailsView = new DetailsView();

            detailsView.onSave = function (data) {
                var marketeersModel = data.id ? self.marketeersCollection.get(data.id) : modelsFactory.createMarketeer(data);

                marketeersModel.save({
                    fullName: data.fullName,
                    location: data.location
                }, {
                    success: function (data) {
                        marketeersModel.id = data.id;
                        self.marketeersCollection.add(marketeersModel, {merge: true});
                        self.marketeersListView.updateRow(data.toJSON());
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

        marketeersCollectionModelRemoved: function (model) {
            this.marketeersListView.removeMarketeerRow(model.id);
        },

        newMarketeersCollectionModelRemoved: function (model) {
            this.addedMarketeersView.removeNotificationRow(model.id);
        },

        changeMarketeersCollectionModelRemoved: function (model) {
            this.changedMarketeersView.removeNotificationRow(model.id);
        },

        //endregion

        //region Render

        render: function () {
            var data;
            var self = this;

            $('#leftMenuHolder').show();

            this.$el.html(this.template());
            this.marketeersListView = new MarketeersListView({el: '#marketeersTable'});
            this.marketeersCollection.fetch({
                success: function (data) {
                    self.initializeMarketeersTab(data.toJSON());
                }
            });

            this.addedMarketeersView = new AddedMarketeersView({el: '#addedMarketeers'});
            this.newMarketeersCollection.fetch({
                success: function (data) {
                    self.initializeAddedMarketeersView(data.toJSON());
                }
            });

            this.changedMarketeersView = new ChangedMarketeersView({el: '#changedMarketeers'});
            this.changeMarketeersCollection.fetch({
                success: function (data) {
                    self.initializeChangedMarketeersView(data.toJSON());
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