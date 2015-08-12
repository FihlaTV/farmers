/**
 * Created by andrey on 03.06.15.
 */

define([], function () {
    var Model = Backbone.Model.extend({
        idAttribute: '_id',
        url: function () {
            if (this.get('_id')){
                return "/taxonomy/value/" + this.get('_id');
            }
            return "/taxonomy/value/"+this.get('taxonomyName');
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