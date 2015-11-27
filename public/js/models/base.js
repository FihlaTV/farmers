define([], function () {
    var Model = Backbone.Model.extend({
        idAttribute: "_id",

        initialize: function () {
            this.on('invalid', function (model, errors) {
                var errorsLength = errors.length;

                if (errorsLength > 0) {
                    for (var i = errorsLength - 1; i >= 0; i--) {
                        App.render({type: 'error', message: errors[i]});
                    }
                }
            });
        }

        //parse: function (model) {
        //    if (model.createdBy && model.createdBy.date) {
        //        model.createdBy.date = custom.dateFormater('DD.MM.YYYY', model.createdBy.date);
        //    }
        //
        //    if (model.lastAccess) {
        //        model.lastAccess = custom.dateFormater('DD.MM.YYYY', model.lastAccess);
        //    }
        //
        //    if (model.dateJoined) {
        //        model.dateJoined = custom.dateFormater('DD MMM, YYYY', model.dateJoined);
        //    }
        //
        //    return model;
        //}
    });
    return Model;
});