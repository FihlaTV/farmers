/**
 * Created by andrey on 02.06.15.
 */

define([
    'text!templates/taxonomy/taxonomyTemplate.html',
    'models/taxonomyModel',
    'collections/taxonomyCollection',
    'views/taxonomy/taxonomyItemView',
    'text!templates/value/taxonomyEditTemplate.html'
], function (TaxonomyTemp, TaxonomyModel, TaxonomyCollection, TaxonomyItemView, TaxEditTemplate ) {

    var View;
    View = Backbone.View.extend({

        events: {
            'click li.taxName'         : 'showValues',
            'click #button>.circle'  : 'createTaxonomy',
            'click #addTaxButton'    : 'addTaxonomy',
            'click #cancelTaxButton' : 'cancel'
        },

        el: '#wrapper',

        initialize: function (options) {

            this.taxonomiesCollection = new TaxonomyCollection();

            this.listenTo(this.taxonomiesCollection, 'sync remove', this.render);

            this.render();
        },

        createTaxonomy: function(event){

            $(event.target).parent().addClass('close');

            this.$el.find('#buttonContainer').prepend(_.template(TaxEditTemplate));


        },

        addTaxonomy: function(event){
            var self = this;
            var form = $(event.target).closest('.createForm');
            var container = form.parent();
            form.addClass('close');

            container.find('#button').removeClass('close');

            var name = form.find('.valueEdit').val();
            var level = form.find('[type="radio"]:checked').val();

            var data = {
                "taxonomyName"  : name,
                "lvl" : level
            };

            var addModel = new TaxonomyModel();
            addModel.save(data, {
                wait : true,
                success : function(model){
                    //self.taxonomiesCollection.add(model);
                    //self.taxonomiesCollection.fetch({reset : true});
                    Backbone.history.fragment = '';
                    //window.location.hash = 'taxonomy1';
                    Backbone.history.navigate("taxonomy", {trigger: true});

                },
                error: function(xhr, err){
                    alert('Please insert correct name and level');
                }
            })
        },

        afterUpend: function () {
            this.render();
        },


        showValues: function (e){
            var id = $(e.target).closest('li').attr('id');
            var valuesContainer = this.$el.find('#valuesConteiner');
            var self = this;
            var data = {};
            var myArray;
            var taxName;

            var clickEl = $(e.target).closest('li');
            clickEl.parent().find('li.active').removeClass('active');
            clickEl.addClass('active');

            var model = new TaxonomyModel({'_id':id});
            model.fetch({
                success: function (model) {
                    myArray = model.get('values');
                    taxName = model.get('_id');
                    //level = model.get('lvl');


                    var data = {
                        'values' : myArray,
                        'name'   : taxName
                    };

                    if (self.childView) {
                        self.childView.undelegateEvents();
                        valuesContainer.html('')
                    }

                    self.childView = new TaxonomyItemView(data);

                    valuesContainer.append(
                        self.childView.render().el
                    );
                },
                error: function () { alert('Please refresh browser'); }
            });

            //var model = this.taxonomiesCollection.get(id);
            //myArray = model.get('values');
            //taxName = model.id;
            //
            //        if (this.childView) {
            //            this.childView.undelegateEvents();
            //            valuesContainer.html('')
            //        }
            //
            //        this.childView = new TaxonomyItemView({'values' : myArray, 'name' : taxName});
            //
            //        valuesContainer.append(
            //            this.childView.render().el
            //        );

        },

        cancel: function(event){
            var form = $(event.target).closest('.createForm');
            var container = form.parent();

            form.addClass('close');
            container.find('#button').removeClass('close');

        },


        render: function () {

            var taxonomies = this.taxonomiesCollection;

            this.$el.html(_.template(TaxonomyTemp, {taxonomies: taxonomies}));
            return this;
        }

    });

    return View;
})
;