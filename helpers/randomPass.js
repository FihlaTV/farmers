// JavaScript source code
var randomPass = (function randomPass() {
    'use strict';
    var uuid = require('node-uuid')();
    var CONST = require('../constants/constants.js');

    function generate(charType, length) {
        var now = (new Date()).valueOf();
        var charSources = {
            alphabetical: CONST.ALPHABETICAL_FOR_TOKEN + now,
            numerical: '1234567890'
        };

        var charSource = charSources[charType] || charSources.alphabetical;
        var passLength = length || 50;
        var res = '';
        var doIt = true;
        var i = 0;

        function randomNumber(m) {
            return Math.floor((Math.random() * m));
        }

        while (doIt) {
            res += charSource.substr(randomNumber(charSource.length), 1);
            if (i === passLength) {
                doIt = false;
            }
            i++;
        }
        if (!charType && !length) {
            res = res + now;
        }
        if (!doIt) {
            return res;
        }
    };

    function generateUuid() {
        var uuidLocal = uuid;
        return uuidLocal;
    };

    return {
        generate: generate,
        generateUuid: generateUuid
    };
})();

module.exports = randomPass;

