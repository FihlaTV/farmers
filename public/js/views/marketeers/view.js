define([
    'text!templates/marketeers/marketeersTemplate.html',
    'collections/collectionFactory',
    'models/modelsFactory',
    'views/marketeers/list',
    'views/marketeers/activityList',
    'views/marketeers/details'
], function (template, collectionFactory, modelsFactory, MarketeersListView, ActivityListView, DetailsView) {
    var View = Backbone.View.extend({
        //region Initialization

        template   : _.template(template),
        dataContent: "marketeers",

        initialize: function () {
            this.marketeersCollection = collectionFactory.createMarketeersCollection();
            this.marketeersListView = new MarketeersListView();
            //  this.activityListView = new ActivityListView()

            this.initializeMarketeersListAndCollection();
        },

        //endregion

        //region Ui Events

        events: {
            'click .tabButton': "changeTab"
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

        //endregion

        //region Methods

        initializeMarketeersListAndCollection: function () {
            var self = this;

            this.marketeersCollection.on('reset', this.marketeersCollectionReseted, this);
            this.marketeersCollection.on('add', this.marketeersCollectionModelAdded, this);
            this.marketeersCollection.on('remove', this.marketeersCollectionModelRemoved, this);
            this.marketeersCollection.on('change', this.marketeersCollectionChanged, this);

            this.marketeersListView.onEditMarketeer = function (args) {
                var id = args.id;
                var marketeer = self.marketeersCollection.get(id);
                self.openMarketeersDetailsDialog(marketeer.toJSON());
            };

            this.marketeersListView.onDeleteMarketeer = function (args) {
                var id = args.id;
                var marketeer = self.marketeersCollection.get(id);

                marketeer.destroy({
                    success:function(){
                        self.marketeersCollection.remove(id);
                        self.marketeersListView.removeMarketeerRow(id);
                    },
                    err:function(err){
                        alert(err);
                    }
                });

            }
        },

        openMarketeersDetailsDialog: function (marketeer) {
            var self = this;
            var detailsView = new DetailsView(marketeer);

            detailsView.onSave = function (data) {
                var marketeersModel = data.id ? self.marketeersCollection.get(data.id) : modelsFactory.createMarketeer(data);

                marketeersModel.save({
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
            }
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

        marketeersCollectionChanged:function(args){

        },

        //endregion

        //region Render

        render: function () {
            var data;

            this.$el.html(this.template());
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