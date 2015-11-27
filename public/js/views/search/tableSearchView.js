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
            this.collection=[].concat(this.initialCollection);
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
            var searchedElements;
            var resultCollection;
            var searchCollection;
            var hideValues;
            var value = $(e.target).val();
            var prevValue = this.value;
            if (value === prevValue) {
                return;
            }

            if (value.isSubstringOf(prevValue)){
                searchCollection=this.previousCollection;
                resultCollection=this.collection;
            }
            else if (prevValue.isSubstringOf(value)){
                searchCollection=this.collection;
                resultCollection=this.previousCollection;
            } else{
                this.collection=[].concat(this.initialCollection);
                searchCollection=this.collection;

                for (i =this.previousCollection.length;i--;){
                    searchedElements+=', #'+this.previousCollection[i].id;
                }
                this.previousCollection=[];

                resultCollection=[];
            }



            this.value = value;

            hideValues = this.length < value.length;

            searchCollection = hideValues ? this.collection : this.previousCollection;
            resultCollection = hideValues ? this.previousCollection : this.collection;
            searchedElements = '';
            this.length = value.length;

            for (var i = searchCollection.length; i--;) {
                if (!searchCollection[i].search.contains(value)) {
                    arrayElement = searchCollection.splice(i, 1)[0];
                    searchedElements += (', #' + arrayElement.id);
                    resultCollection.push(arrayElement);
                }
            }

            this.onSearchChanged({
                jquerySearchStringToHide: searchedElements.substring(2),
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