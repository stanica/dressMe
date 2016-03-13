"use strict";
var http = require('http');
/*
 * Route the incoming request based on type (LaunchRequest, IntentRequest,
 * etc.) The JSON body of the request is provided in the event parameter.
 */
exports.handler = function (event, context) {
    try {
        var callback = function (sessionAttributes, speechletResponse) {
            context.succeed(
                buildResponse(sessionAttributes, speechletResponse)
            );
        };

        /*if (event.session.application.applicationId !== "amzn1.echo-sdk-ams.app.[unique-value-here]") {
             context.fail("Invalid Application ID");
        }*/

        if (event.request.type === "LaunchRequest") {
            getWelcomeResponse(callback);
        }

        if (event.request.type === "IntentRequest") {
            onIntent(event.request, event.session, callback);
        }

        if (event.request.type === "SessionEndedRequest") {
            context.succeed();
        }

    } catch (err) {
        context.fail(err);
    }
};

/*
 * Called when the user specifies an intent for this skill.
 */
function onIntent(intentRequest, session, callback) {
    var intent = intentRequest.intent,
        intentName = intentRequest.intent.name;

    switch (intentName) {
        case "VeryPositiveIntent":
            if (["DressMeDefault", "DressMeSituation", "DressMeDescription"].indexOf(lastIntent) > -1) {
                handleDressMeReflectIntent("very_positive", intent, session, callback);
            } else {
                getWelcomeResponse(callback);
            }
            break;

        case "PositiveIntent":
            if (["DressMeDefault", "DressMeSituation", "DressMeDescription"].indexOf(lastIntent) > -1) {
                handleDressMeReflectIntent("positive", intent, session, callback);
            } else {
                getWelcomeResponse(callback);
            }
            break;

        case "NegativeIntent":
            if (["DressMeDefault", "DressMeSituation", "DressMeDescription"].indexOf(lastIntent) > -1) {
                handleDressMeReflectIntent("negative", intent, session, callback);
            } else {
                getWelcomeResponse(callback);
            }
            break;

        case "VeryNegative":
            if (["DressMeDefault", "DressMeSituation", "DressMeDescription"].indexOf(lastIntent) > -1) {
                handleDressMeReflectIntent("very_negative", intent, session, callback);
            } else {
                getWelcomeResponse(callback);
            }
            break;

        case "SkipIntent":
            if (["DressMeDefault", "DressMeSituation", "DressMeDescription"].indexOf(lastIntent) > -1) {
                handleDressMeReflectIntent("skip", intent, session, callback);
            } else {
                getWelcomeResponse(callback);
            }
            break;

        case "DressMeDefault":
            handleDressMe("casual", intent, session, callback);
            break;

        case "DressMeSituation":
            handleDressMe(intent.slots.Situation.value, intent,
                          session, callback);
            break;

        case "DressMeDescription":
            handleDressMe(intent.slots.Description.value,  intent,
                          session, callback);
            break;

        case "AddClothes":
            handleAddClothes(intent, session, callback);
            break;

        case "GiveMeRandom":
            handleGiveMeRandom(intent, session, callback);
            break;

        case "GoodForIntent":
            handleGoodForIntent(intent, session, callback);

        case "GetTemperature":
            handleGetTemperature(intent, session, callback);
            break;

        case "AMAZON.HelpIntent":
            getWelcomeResponse(callback);
            break;

        default:
            throw "Invalid Intent";
    }
}

function handleGoodForIntent(intent, session, callback) {
    http.get("http://dress-me-api.herokuapp.com/good_for/" + intent.slots.Intent.value.toLowerCase().replace(' ', '%20'), function(res){
        res.on('data', function (data) {
            callback({},
                 buildSpeechletResponse(intent.name, "Note it", null, false));
        });
    }).on('error', function(){
        callback({},
             buildSpeechletResponse(intent.name, "Sorry. I can't do it", null, false));
    });

}

/*
 * Welcome Message
 */
function getWelcomeResponse(callback) {
    var sessionAttributes = {};
    var cardTitle         = "Welcome";
    var speechOutput      = "Hello, I am your stylist."
    var repromptText      = "Please tell me your favorite color by saying, " +
                            "my favorite color is red";
    var shouldEndSession  = false;

    callback(
        {},
        buildSpeechletResponse(
            cardTitle, speechOutput, repromptText, shouldEndSession
        )
    );
}


function handleDressMeReflectIntent(reflect, intent, session, callback) {
    http.get("http://dress-me-api.herokuapp.com/res/" + reflect, function(res){
        res.on('data', function (data) {
            callback({},
                 buildSpeechletResponse(intent.name, "Note it", null, false));
        });
    }).on('error', function(){
        callback({},
             buildSpeechletResponse(intent.name, "Sorry. I can't do it", null, false));
    });

}

function handleGiveMeRandom(intent, session, callback) {
    http.get("http://dress-me-api.herokuapp.com/rand" , function(res){
        res.on('data', function (data) {
            var pData = JSON.parse(data)
            console.log(pData);
            if (pData.length == 2) {
                callback({},
                     buildSpeechletResponse(intent.name, "You should wear " + pData[0] + " and " + pData[1] + ".", null, false));
            } else if (pData.length == 1) {
                callback({},
                     buildSpeechletResponse(intent.name, "You should wear " + pData[0] + ".", null, false));
            } else {
                callback({},
                     buildSpeechletResponse(intent.name, "I don't have any suggestion", null, false));
                 }

        });
    }).on('error', function(){
        callback({},
             buildSpeechletResponse(intent.name, "Sorry. I can't add this clothes", null, false));
    });
}
/*
 * Main DressMe handler
 */
function handleDressMe(situation, intent, session, callback) {
    var sessionAttributes = getSessionAttributes(session);

    http.get("http://dress-me-api.herokuapp.com/give/" + situation.toLowerCase().replace(' ', '%20') , function(res){
        res.on('data', function (data) {
            var pData = JSON.parse(data)
            console.log(pData);
            if (pData.length == 2) {
                callback({},
                     buildSpeechletResponse(intent.name, "You should wear " + pData[0] + " and " + pData[1] + ".", null, false));
            } else if (pData.length == 1) {
                callback({},
                     buildSpeechletResponse(intent.name, "You should wear " + pData[0] + ".", null, false));
            } else {
                callback({},
                     buildSpeechletResponse(intent.name, "I don't have any suggestion", null, false));
                 }

        });
    }).on('error', function(){
        callback({},
             buildSpeechletResponse(intent.name, "Sorry. I can't add this clothes", null, false));
    });
}

function handleAddClothes(intent, session, callback) {
    var query = intent.slots.Clothes.value.replace('.', '').replace(' ', '%20');
    http.get("http://dress-me-api.herokuapp.com/add/" + query , function(res){
        res.on('data', function (data) {
            console.log(data);
            callback({},
                 buildSpeechletResponse(intent.name, "Got it", null, false));
        });
    }).on('error', function(){
        callback({},
             buildSpeechletResponse(intent.name, "Sorry. I can't add this clothes", repromptText, shouldEndSession));
    });
}

function handleGetTemperature(intent, session, callback) {
    var sessionAttributes = getSessionAttributes(session);
    var repromptText = null;
    var shouldEndSession = false;
    getTemperature(callback);
}

 // --------------- Helper functions -----------------------

function getTemperature(callback) {
    http.get("http://dress-me-api.herokuapp.com/var/temp", function(res){
        res.on('data', function (temperature) {
            var speechOutput = "The current temperature is " + temperature + " degrees";

            callback({},
                 buildSpeechletResponse("Hi", temperature, null, false));
        });
    }).on('error', function(){
        var speechOutput = "I can't get the current temperature";

        callback({},
             buildSpeechletResponse(intent.name, speechOutput, repromptText, shouldEndSession));
    });

}

function getSessionAttributes(session) {
    var attributes = session.attributes;
    if (typeof attributes === "undefined") attributes = {};
    if (typeof attributes.lastcombo === "undefined") attributes.lastcombo = {};
    return attributes;
}

function buildSpeechletResponse(title, output, repromptText, shouldEndSession) {
    output = "<speak>" + output + "</speak>";
    return {
        outputSpeech: {
            type: "SSML",
            ssml: output
        },
        card: {
            type: "Simple",
            title: "SessionSpeechlet - " + title,
            content: "SessionSpeechlet - " + output
        },
        reprompt: {
            outputSpeech: {
                type: "PlainText",
                text: repromptText
            }
        },
        shouldEndSession: shouldEndSession
    };
}

function buildResponse(sessionAttributes, speechletResponse) {
    return {
        version: "1.0",
        sessionAttributes: sessionAttributes,
        response: speechletResponse
    };
}
