var Promise = require('bluebird');
var util = require('util');

module.exports = {

    joinGame: function (gameName) {

        return new Promise(function (resolve) {
            message = util.format("I know you want to play \"%s\" but I'm not ready to help you yet! Come back soon!", gameName);

            // complete promise with a timer to simulate async response
            setTimeout(function () { resolve(message); }, 1000);

        });

    }
}