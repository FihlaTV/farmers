var express = require('express');
var router = express.Router();
var Notifications = require('../handlers/notifications');
var SessionHandler = require('../handlers/sessions');

module.exports = function(db){
    var notifications = new Notifications(db);
    var session = new SessionHandler(db);

    router.get('/getMergedNotification', notifications.getMergedNotification);

    router.get('/marketeer/count',  session.isAdmin, notifications.getMarketeerNotificationCount);

    router.get('/newMarketeer/count',  session.isAdmin, notifications.getNewMarketeerNotificationCount);
    router.get('/newMarketeer',  session.isAdmin, notifications.getNewMarketeerNotification);

    router.get('/changeMarketeer/count', session.isAdmin, notifications.getChangeMarketeerMarketeerNotificationCount);
    router.get('/changeMarketeer', session.isAdmin, notifications.getChangeMarketeerMarketeerNotification);
    router.get('/newCrop/count',  session.isAdmin, notifications.getNewCropNotificationCount);

    router.route('/:id')
        .delete(session.isAdmin, notifications.deleteNotification);


    return router;
};
