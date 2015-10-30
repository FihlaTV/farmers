var express = require('express');
var router = express.Router();
var Notifications = require('../handlers/notifications');
var SessionHandler = require('../handlers/sessions');

module.exports = function(db){
    var notifications = new Notifications(db);
    var session = new SessionHandler(db);


    router.get('/getMergedNotification', notifications.getMergedNotification);

    return router;
};
