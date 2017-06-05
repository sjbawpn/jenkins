var restify = require('restify');
var builder = require('botbuilder');
var Game = require('./game');

// Setup Restify Server
var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
   console.log('%s listening to %s', server.name, server.url); 
});

// Create chat connector for communicating with the Bot Framework Service
var connector = new builder.ChatConnector({
    appId: process.env.MICROSOFT_APP_ID,
    appPassword: process.env.MICROSOFT_APP_PASSWORD
});

// Listen for messages from users 
server.post('/api/messages', connector.listen());

// Receive messages from the user and respond by echoing each message back (prefixed with 'You said:')
var bot = new builder.UniversalBot(connector, function (session) {
    session.send('Sorry, I did not understand \'%s\'. Type \'help\' if you need assistance.', session.message.text);
});

localLuisEndpoint = "https://westus.api.cognitive.microsoft.com/luis/v2.0/apps/bbbe471f-16a1-45b7-b5cc-7d540c388a59?subscription-key=8f3e00e8872a44f487b2eca3178dcd69&verbose=true&timezoneOffset=0&spellCheck=true&q=";
var recognizer = new builder.LuisRecognizer(process.env.LUIS_MODEL_URL || localLuisEndpoint);
bot.recognizer(recognizer);

bot.dialog('JoinGame', [

    function (session, args, next) {

        session.send('Hi! You\'ve asked to: \'%s\'', session.message.text);
        // try extracting entities
        var game = builder.EntityRecognizer.findEntity(args.intent.entities, 'Game');

        if (game) {

            // city entity detected, continue to next step

            session.dialogData.searchType = 'city';

            next({ response: game.entity });

        } else {
            // no entities detected, ask user for a destination
            builder.Prompts.text(session, 'Please enter the name of the game');
        }
    },
    function (session, results) {

        var gameName = results.response;
        var message = 'Looking for game: %s';
        session.send(message, gameName);

        // Async search
        Game
            .joinGame(gameName)
            .then(function (gameResult) {
                // args
                session.send(gameResult);
                // End

                session.endDialog();

            });

    }

]).triggerAction({

    matches: 'JoinGame',

    onInterrupted: function (session) {
        session.send('Please provide a game');

    }
});