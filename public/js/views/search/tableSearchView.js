define(['text!templates/search/searchTemplate.html'], function (template) {
    var View = Backbone.View.extend({
        template: _.template(template),
        length  : 0,
        events  : {
            'keyup #searchInput': 'searchInputKeyUp'
        },
        value   : '',

        initialize: function (options) {
            this.initialCollection = this.createSearchCollection(options.dataArray);
            this.collection = [].concat(this.initialCollection);
            this.previousCollection = [];
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
            var arrayElement;
            var i;
            var searchedElements = '';
            var searchCollection=this.collection;
            var value = $(e.target).val();
            var prevValue = this.value;

            if (value === prevValue) {
                return;
            }

            this.value = value;

            for (i = searchCollection.length; i--;) {
                if (!searchCollection[i].search.contains(value)) {
                    arrayElement = searchCollection[i];
                    searchedElements += (', tr#' + arrayElement.id);
                }
            }

            this.onSearchChanged({
                selector: searchedElements.substring(2)
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