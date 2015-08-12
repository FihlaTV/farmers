/**
 * Created by User on 02.06.2015.
 */

define([], function(){
    var Model = Backbone.Model.extend({
        idAttribute: '_id',

        url: function(){
            return '/lesson/' + this.get('_id');
        },

        initialize: function () {
            this.on('invalid', function (model, errors) {
                if (errors.length > 0) {
                    var msg = errors.join('\n');
                    alert(msg);
                }
            });
        }
    });

    return Model;
});