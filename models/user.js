/**
 * Created by User on 27.04.2015.
 */

module.exports = function (db){
    'use strict';

    var mongoose = require('mongoose');
    var schema = mongoose.Schema;
    var visualisation;
    var affirmation;
    var ObjectId = mongoose.Schema.Types.ObjectId;
    var defaultDate = new Date('1900');
    visualisation = new schema({
        id: {
            type: String,
            required: true
        },
        text: String,
        timeToSend: {
            type: String,
            required: true
        },
        imageId: {
            type: String,
            required: true,
            default: null
        }
    });

    affirmation = new schema({
        id: {
            type: String,
            required: true
        },
        text: String,
        timeToSend: {
            type: String,
            lowercase: true,
            default: "any"
        }
    });

    var user = new schema({
        deviceId: { type: String, unique: true, required: true },
        name: String,
        timeZone: {
            type: Number,
            default:0
        },
        affirmations: [affirmation],
        visualisations: [visualisation],
        isUpgraded: {type: Boolean, default: false},
        usersSetting: {
            birthDate: {type: Date, default: defaultDate},
            name: {type: String, default: 'user'},
            gender: {
                type: String,
                default: 'M',
                match: /M|F/i,
                uppercase: true
            },
            sleepTime: {
                start: {type: String, default: '23:00'},
                end: {type: String, default: '09:00'}
            },
            sleepTimeWeekEnd: {
                start: {type: String, default: '23:00'},
                end: {type: String, default: '09:00'}
            },
            height: {type: Number, match: /[0-9]/, default: 160},
            weight: {type: Number, match: /[0-9]/, default: 70}
        },
        blockedMessages: [],
        blockedThemes: [],
        sended: [ObjectId]

    }, {
        collection: 'Users',
        toJSON: {
            virtuals: 1
        },
        id: 0
    });

    user.virtual('countAffirmations').get(function(){
        if (this.isUpgraded){
            return 6;
        } else {
            return 2;
        }
    });

    user.virtual('countVisualisations').get(function(){
        if (this.isUpgraded){
            return 6;
        } else {
            return 1;
        }
    });

    var userModel = db.model('user', user);


};

