define(['text!templates/search/searchTemplate.html'], function (template) {
    var View = Backbone.View.extend({
        template: _.template(template),
        events  : {
            'keyUp #searchInput': 'searchInputKeyUp'
        },

        initialize: function (options) {
            this.collection = this.createSearchCollection(options.dataArray);
        },

        createSearchCollection: function (dataArray) {
            var collection = [];
            var object;
            var element;

            for (var i = dataArray.length; i--;) {
                element = dataArray[i];
                object = {search: ''};
                for (var field in element) {
                    if (field === '_id') {
                        object.id = element._id;
                    }
                    else {
                        object.search += element[field];
                    }
                }
                collection.push(object);
            }

            return collection;
        },

        searchInputKeyUp: function (e) {
            var value = $(e.target).val();
            var collection = this.collection;
            var searchedElements = '';

            for (var i = collection.length; i--;) {
                if (!~collection[i].search.indexOf(value)) {
                    searchedElements.push(' #' + collection[i].id);
                }
            }

            this.onSearchChanged({
                jquerySearchStringToHide: searchedElements.trimLeft(),
                searchLength            : value.length
            });

        },

        onSearchChanged: function (args) {

        },

        render: function () {
            this.$el.html(this.template());
        }
    });

    return View;
});