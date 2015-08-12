/**
 * Created by andrey on 04.06.15.
 */

define([
    'collections/taxonomyCollection',
    'text!templates/lessons/lessonsItemTemplate.html',
    'views/lessons/valuesForLessonView',
    'models/taxonomyModel',
    'text!templates/lessons/valuesForLessonTemplate.html'

], function (TaxonomyCollection , LessonItemTmpl, ValuesView , TaxonomyModel, ValuesTMPL) {

    var View;
    View = Backbone.View.extend({

        className: 'lessonContainer',

        events: {
            'click .taxName'   : 'showValues',
            'click .valueName' : 'chooseValue'

        },

        initialize: function (options) {

            this.currentModel = options.model;

            this.activName ='';
            this.resultData={};

            this.taxonomiesCollection = new TaxonomyCollection();

            this.listenTo(this.taxonomiesCollection, 'sync remove', this.render);

            this.render();

        },

        showValues: function (event){
            var target = $(event.target);
            var id = target.attr('id');
            this.activName=id;
            var self = this;
            var myArray;
            var taxName;
            var valuesContainer = $('#rightLes');

            var model = new TaxonomyModel({'_id':id});
            model.fetch({
                success: function (model) {
                    myArray = model.get('values');
                    taxName = model.id;

                    valuesContainer.html(_.template(ValuesTMPL, {values: myArray}));
                },
                error: function () {
                    alert('Please refresh browser');
                }
            });
        },

        chooseValue: function(event){
            var target = $(event.target);
            var container = target.closest('#rightLes');
            container.find('.active').removeClass('active');
            target.addClass('active');
            var targetId = target.attr('id');
            var targetNam = this.activName;

            this.resultData[targetNam] = targetId;

            alert(this.taxonomiesCollection.length + ' / ' + _.keys(this.resultData).length);
        },

        render: function () {

            var taxonomies = this.taxonomiesCollection.toJSON();

            this.$el.html(_.template(LessonItemTmpl,{taxonomies: taxonomies , model : this.currentModel}));

            return this;
        }

    });

    return View;
})
;
