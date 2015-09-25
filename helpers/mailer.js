module.exports = new function () {

    var nodemailer = require('nodemailer');
    var sgTransport = require('nodemailer-sendgrid-transport');
    var _ = require('../public/js/libs/underscore/underscore-min.js');
    var fs = require('fs');

    require('../config/development');

    this.sendReport = function (options, callback) {

        var attachments = [];
        var attachment = options.attachment;

        var mailOptions = {
            from: options.from,
            to: options.mailTo,
            subject: options.title,
            html: _.template(fs.readFileSync(options.templateName, encoding = "utf8"))(options.templateData)
        };

        if (attachment) {
            var matches = attachment ? attachment.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/): '';
            var imageData = {};
            if (!matches || matches.length !== 3) {
                try {
                    imageData.type = 'image/png';
                    imageData.data = attachment;
                    imageData.extention = 'png';
                } catch (err) {
                    callback({error: 'Invalid input string'});
                    return;
                }
            } else {
                imageData.type = matches[1];
                imageData.data = matches[2];
            }
            imageData.expansion = imageData.type.replace(/image\//,'');

            attachments[0] = {
                filename: 'atachment.' + imageData.expansion,
                content:imageData.data,
                encoding: 'base64'
            };
            mailOptions.attachments = attachments;
        }

        deliver(mailOptions, callback);
    };

    function deliver(mailOptions, callback) {

        var authOptions = {
            auth: {
                api_user: process.env.MAIL_USERNAME,
                api_key: process.env.MAIL_PASSWORD
            }
        };

        var mailerClient = nodemailer.createTransport(sgTransport(authOptions));

        mailerClient.sendMail(mailOptions, function (err, response) {
            if (err) {
                console.error('Email did not send: ' + err);
                if (callback && typeof callback === 'function') {
                    callback(err, null);
                }
            } else {
                console.log('Email sent:' ,response);
                if (callback && typeof callback === 'function') {
                    callback(null, response);
                }
            }
        });
    }
};

