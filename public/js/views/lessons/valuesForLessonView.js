/**
 * Created by User on 05.06.2015.
 */
define([
    'text!templates/lessons/valuesForLessonTemplate.html'
], function (valuesTemplate) {

    var View;
    View = Backbone.View.extend({


        events: {
        },

        initialize: function (options) {

            this.valuesArray = options.values;
            this.taxName = options.name;

            this.render();
        },


        render: function () {

            this.$el.html(_.template(valuesTemplate, {values: this.valuesArray}));

            return this;
        }

    });

    return View;
})
;