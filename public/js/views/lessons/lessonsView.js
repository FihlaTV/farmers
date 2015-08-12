/**
 * Created by User on 02.06.2015.
 */

define([
    'text!templates/lessons/lessonsTemplate.html',
    'views/lessons/lessonsItemView',
    'collections/lessonsCollection'
], function(LessonsTemp, LessonItemView, LessonsCollection){

    var View = Backbone.View.extend({
        events: {
            'click .lessonButton' : 'lessonClick'
        },

        el: '#wrapper',

        initialize: function () {

            this.lessonsCollection = new LessonsCollection();

            this.listenTo(this.lessonsCollection, 'sync remove', this.render);

            this.render();
        },

        afterUpend: function () {
            this.render();
        },

        lessonClick: function (event) {
            var target = $(event.target);
            var targetId = target.attr('id');
            var container = target.closest('.lesson');

            this.currentModel = this.lessonsCollection.get(targetId);

            if (this.childView) {
                this.childView.undelegateEvents();
            }

            this.childView = new LessonItemView({'model' : this.currentModel.toJSON()});

            container.append(
                this.childView.render().el
            );

        },

        render: function () {
            var lessons = this.lessonsCollection.toJSON();
            this.$el.html(_.template(LessonsTemp, {lessons: lessons}));
            return this;
        }
    });

    return View;

});