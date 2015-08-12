/**
 * Created by eriy on 12.03.2015.
 */
module.exports = (function () {
    var wns = require( 'wns' );

    var wnsClass = function ( clientId, clientSecret ) {

        var connectionOptions = {
            client_id: '000000004C14EE71',
            client_secret: "c4JJzw7O3W5ugNwayTWbsxVR7bp6XZy5"
        };

        function sendPush( channelUrl, msg) {
            var sendingMessageObject = {};
            var notificationType = 'sendToastText01';

            sendingMessageObject.type = notificationType;
            sendingMessageObject.text1 = msg;

            if (! channelUrl || !( typeof(channelUrl) === 'string') ) {
                return false
            }

            wns.sendToast( channelUrl, sendingMessageObject, connectionOptions, function (err, result) {

                console.log('*********************Result Windows Notification Service**************************');
                console.dir(result);
                console.log('*********************-AFTER RESULT-***************************');
            });
        }

        wns.sendPush = sendPush;
        return wns;
    };

    return wnsClass;

})();