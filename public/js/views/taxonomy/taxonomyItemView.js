/**
 * Created by andrey on 02.06.15.
 */

define([
    'text!templates/taxonomy/taxonomyItemTemplate.html',
    'text!templates/value/valueEditTemplate.html',
    'models/valueModel'
], function (TaxonomyItTemplate, ValueEditTemplate, ValueModel) {

    var View;
    View = Backbone.View.extend({

        el: '#valuesConteiner',

        events: {
            'click .edit'         : 'editValue',
            'click .remove'       : 'deleteValue',
            'click #addButton'    : 'addValue',
            'click #cancelButton' : 'cancel',
            'click .circle'       : 'createValue'

        },

        initialize: function (options) {

            this.valuesArray = options.values;
            this.taxName = options.name;

            this.render();
        },

        editValue: function (event){

            var holder = $(event.target).closest('.taxValue');
            var anotherForm = this.$el.find('.editForm');

            this.closeForm(anotherForm);



            holder.addClass('close');


            var container = holder.closest('.valContainer');
            var name =holder.find('.valueName').text();
            var id = holder.attr('id');
            var data={
                'id' : id,
                'name' : name
            };

            container.prepend(_.template(ValueEditTemplate,{data : data}));

        },

        deleteValue: function (event){
            var holder = $(event.target).closest('.taxValue');
            var id = holder.attr('id');
            var deleteModel = new ValueModel({'_id':id});
            deleteModel.destroy({
                success: function () {
                    holder.remove();
                },
                error: function (model, err) {
                    if (err.status === 400) {
                        alert("You do not have permission to perform this action");
                    }
                }
            });


        },

        createValue: function(event){
            var holder = $(event.target).closest('.addValue');
            var form = this.$el.find('.editForm');

            this.closeForm(form);

            holder.addClass('close');

            var container = holder.closest('.valContainer');

            var data = {};
            container.prepend(_.template(ValueEditTemplate, {data: data}));

        },

        addValue : function (event){
            var self = this;

            var form = $(event.target).closest('.editForm');

            var container = form.closest('.valContainer');


            var id = form.attr('id');

            var name = form.find('.valueEdit').val();
            var editModel;
            var createData;
            if (id !== 'editId') {
                editModel = new ValueModel({'_id': id});
                editModel.save({'value': name}, {
                    wait: true,
                    success: function (data) {
                        $('#' + id + '.taxValue>.valueName').text(name);
                        form.remove();

                        container.find('.taxValue').removeClass('close');
                        container.find('.addValue').removeClass('close');
                    },
                    error: function (err) {
                        alert('Please insert correct value name');
                    }
                });
            } else {

                editModel = new ValueModel();

                createData = {
                    "taxonomyName"  : self.taxName,
                    "value"         : name
                };

                editModel.save(createData, {
                    wait: true,
                    success: function (model) {
                        var currentId = model.get('taxonomyValue')._id;
                        var block = '<div class="valContainer"><div class="taxValue" id="' + currentId + '"' + '><div class="valueName">' + name + '</div><div class="remove"></div><div class="edit"></div></div></div>';
                        container.before(block);
                        form.remove();

                        container.find('.taxValue').removeClass('close');
                        container.find('.addValue').removeClass('close');
                    },
                    error: function (err) {
                        alert('Please insert correct value name');
                    }
                });
            }
        },

        closeForm: function(form){
            var container = form.closest('.valContainer');

            form.remove();

            container.find('.taxValue').removeClass('close');
            container.find('.addValue').removeClass('close');
        },

        cancel: function(event){

            var form = $(event.target).closest('.editForm');

            this.closeForm (form);
        },

        render: function () {

            this.$el.html(_.template(TaxonomyItTemplate, {values: this.valuesArray}));

            return this;
        }

    });

    return View;
})
;