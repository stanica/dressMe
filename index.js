/**
 * This sample demonstrates a simple skill built with the Amazon Alexa Skills Kit.
 * The Intent Schema, Custom Slots, and Sample Utterances for this skill, as well as
 * testing instructions are located at http://amzn.to/1LzFrj6
 *
 * For additional samples, visit the Alexa Skills Kit Getting Started guide at
 * http://amzn.to/1LGWsLG
 */

// Route the incoming request based on type (LaunchRequest, IntentRequest,
// etc.) The JSON body of the request is provided in the event parameter.
exports.handler = function (event, context) {
    try {
        console.log("event.session.application.applicationId=" + event.session.application.applicationId);

        /**
         * Uncomment this if statement and populate with your skill's application ID to
         * prevent someone else from configuring a skill that sends requests to this function.
         */
        /*
        if (event.session.application.applicationId !== "amzn1.echo-sdk-ams.app.[unique-value-here]") {
             context.fail("Invalid Application ID");
        }
        */

        if (event.session.new) {
            onSessionStarted({requestId: event.request.requestId}, event.session);
        }

        if (event.request.type === "LaunchRequest") {
            onLaunch(event.request,
                event.session,
                function callback(sessionAttributes, speechletResponse) {
                    context.succeed(buildResponse(sessionAttributes, speechletResponse));
                });
        } else if (event.request.type === "IntentRequest") {
            onIntent(event.request,
                event.session,
                function callback(sessionAttributes, speechletResponse) {
                    context.succeed(buildResponse(sessionAttributes, speechletResponse));
                });
        } else if (event.request.type === "SessionEndedRequest") {
            onSessionEnded(event.request, event.session);
            context.succeed();
        }
    } catch (e) {
        context.fail("Exception: " + e);
    }
};

/**
 * Called when the session starts.
 */
function onSessionStarted(sessionStartedRequest, session) {
    console.log("onSessionStarted requestId=" + sessionStartedRequest.requestId +
        ", sessionId=" + session.sessionId);
}

/**
 * Called when the user launches the skill without specifying what they want.
 */
function onLaunch(launchRequest, session, callback) {
    console.log("onLaunch requestId=" + launchRequest.requestId +
        ", sessionId=" + session.sessionId);

    // Dispatch to your skill's launch.
    getWelcomeResponse(callback);
}

/**
 * Called when the user specifies an intent for this skill.
 */
function onIntent(intentRequest, session, callback) {
    console.log("onIntent requestId=" + intentRequest.requestId +
        ", sessionId=" + session.sessionId);

    var intent = intentRequest.intent,
        intentName = intentRequest.intent.name;

    if (!session.attributes) {
        session.attributes = {};
    }
    session.attributes.expectedIntent = session.attributes.nextIntent;
    session.attributes.nextIntent = null;

    // Dispatch to your skill's intent handlers
    if ("RandomIntent" === intentName) {
        handleRandomIntent(intent, session, callback);
    } else if ("SetFavoriteColor" === intentName) {
        handleSetFavoriteColor(intent, session, callback);
    } else if ("SetName" === intentName) {
        handleSetName(intent, session, callback);
    } else if ("GetSelfInfo" === intentName) {
        handleGetSelfInfo(intent, session, callback);
    } else if ("DressMeDefault" === intentName) {
        handleDressMeDefault(intent, session, callback);
    } else if ("DressMeSituation" === intentName) {
        handleDressMeSituation(intent, session, callback);
    } else if ("DressMeDescription" === intentName) {
        handleDressMeDescription(intent, session, callback);
    } else if ("AddClothes" === intentName) {
        handleAddClothes(intent, session, callback);
    } else if ("ListAllClothes" === intentName) {
        handleListAllClothes(intent, session, callback);
    } else if ("AMAZON.HelpIntent" === intentName) {
        getWelcomeResponse(callback);
    } else {
        throw "Invalid intent";
    }
}

/**
 * Called when the user ends the session.
 * Is not called when the skill returns shouldEndSession=true.
 */
function onSessionEnded(sessionEndedRequest, session) {
    console.log("onSessionEnded requestId=" + sessionEndedRequest.requestId +
        ", sessionId=" + session.sessionId);
    // Add cleanup logic here
}

// --------------- Functions that control the skill's behavior -----------------------

function getWelcomeResponse(callback) {
    // If we wanted to initialize the session to have some attributes we could add those here.
    var sessionAttributes = {};
    var cardTitle = "Welcome";
    var speechOutput = "Hello, I am your stylist. ";
    // If the user either does not reply to the welcome message or says something that is not
    // understood, they will be prompted again with this text.
    var repromptText = "Please tell me your favorite color by saying, " +
        "my favorite color is red";
    var shouldEndSession = false;

    callback(sessionAttributes,
        buildSpeechletResponse(cardTitle, speechOutput, repromptText, shouldEndSession));
}

/**
 * Sets the color in the session and prepares the speech to reply to the user.
 */
function handleSetFavoriteColor(intent, session, callback) {
    var sessionAttributes = getSessionAttributes(session);
    var cardTitle = intent.name;
    var favoriteColorSlot = intent.slots.Color;
    var repromptText = "";
    var shouldEndSession = false;
    var speechOutput = "";

    if (favoriteColorSlot) {
        sessionAttributes.info.color = favoriteColorSlot.value;
        if (sessionAttributes.info.name) {
          speechOutput = "Say Dress me or add new clothes";
          repromptText = "Add clothes";
        } else {
          speechOutput = "What is your name";
          repromptText = "You can tell me your name by saying, my name is Edward";
        }
    } else {
        speechOutput = "I'm not sure what your favorite color is. Please try again";
        repromptText = "I'm not sure what your favorite color is. You can tell me your " +
            "favorite color by saying, my favorite color is red";
    }

    callback(sessionAttributes,
         buildSpeechletResponse(cardTitle, speechOutput, repromptText, shouldEndSession));
}

function handleRandomIntent(intent, session, callback) {
    var sessionAttributes = getSessionAttributes(session);
    var cardTitle = intent.name;
    var nameSlot = intent.slots.Name;
    var repromptText = "";
    var shouldEndSession = false;
    var speechOutput = "";
    var randomIntent = intent.slots.Intent
    console.log(randomIntent.value)

    speechOutput = "Echo " + randomIntent.value;

    callback(sessionAttributes,
         buildSpeechletResponse(cardTitle, speechOutput, repromptText, shouldEndSession));
}

function handleSetName(intent, session, callback) {
    console.log("LOL-1");
    var sessionAttributes = getSessionAttributes(session);
    console.log(sessionAttributes);
    var cardTitle = intent.name;
    var nameSlot = intent.slots.Name;
    var repromptText = "";
    var shouldEndSession = false;
    var speechOutput = "";
    console.log(nameSlot);
    if (nameSlot) {
        sessionAttributes.info.name = nameSlot.value;
        if (sessionAttributes.info.color) {
          speechOutput = "Say Dress me or add new clothes";
          repromptText = "Add clothes";
        } else {
          speechOutput = "What is your favorite color?";
          repromptText = "You can tell me your " +
              "favorite color by saying, my favorite color is red";
        }
    } else {
        speechOutput = "I'm not sure what your favorite color is. Please try again";
        repromptText = "I'm not sure what your favorite color is. You can tell me your " +
            "favorite color by saying, my favorite color is red";
    }

    callback(sessionAttributes,
         buildSpeechletResponse(cardTitle, speechOutput, repromptText, shouldEndSession));
}

function handleGetSelfInfo(intent, session, callback) {
    var sessionAttributes = getSessionAttributes(session);
    var repromptText = null;
    var shouldEndSession = false;
    var speechOutput = "";

    var favoriteColor, name;
    if (sessionAttributes) {
        favoriteColor = sessionAttributes.info.color;
        name = sessionAttributes.info.name;
    }

    if (name) {
      speechOutput += "Hello, " + name + "!";
    }

    if (favoriteColor) {
      speechOutput += "Your favorite color is " + favoriteColor + "."
    }

    if (speechOutput === "") {
      speechOutput = "I don't know much about you. Tell me about yourself. What is your favorite color?"
    }

    // Setting repromptText to null signifies that we do not want to reprompt the user.
    // If the user does not respond or says something that is not understood, the session
    // will end.
    callback(sessionAttributes,
         buildSpeechletResponse(intent.name, speechOutput, repromptText, shouldEndSession));
}

function handleDressMeDefault(intent, session, callback) {
    var sessionAttributes = getSessionAttributes(session);

    handleDressMe("normal", "normal",  intent, session, callback);
}

function handleDressMeSituation(intent, session, callback) {
    var sessionAttributes = getSessionAttributes(session);

    handleDressMe(intent.slots.Situation.value, "normal",  intent, session, callback);
}

function handleDressMeDescription(intent, session, callback) {
    var sessionAttributes = getSessionAttributes(session);

    handleDressMe("normal", intent.slots.Description.value,  intent, session, callback);
}

function handleDressMe(situation, description, intent, session, callback) {
    var sessionAttributes = getSessionAttributes(session);
    var repromptText = null;
    var shouldEndSession = false;
    console.log(situation, description);
    var speechOutput = "It is 22 degrees outside. Clothes for " + situation + " and " + description + " are white H and M tank top and your brown Banana Republic shorts.";

    // Setting repromptText to null signifies that we do not want to reprompt the user.
    // If the user does not respond or says something that is not understood, the session
    // will end.
    callback(sessionAttributes,
         buildSpeechletResponse(intent.name, speechOutput, repromptText, shouldEndSession));
}

function handleListAllClothes(intent, session, callback) {
    var sessionAttributes = getSessionAttributes(session);
    var repromptText = null;
    var shouldEndSession = false;
    var speechOutput = "";

    var l = sessionAttributes.clothes.count;
    if (l == 0) {
        for (var i = 0; i < l; i++) {
            var clothes = sessionAttributes.clothes[i];
            speechOutput += (i+1) + " " + clothes + ". ";
        }
    } else {
        speechOutput = "I don't any of your clothes.";
    }
    // Setting repromptText to null signifies that we do not want to reprompt the user.
    // If the user does not respond or says something that is not understood, the session
    // will end.
    callback(sessionAttributes,
         buildSpeechletResponse(intent.name, speechOutput, repromptText, shouldEndSession));
}

function handleAddClothes(intent, session, callback) {
    var sessionAttributes = getSessionAttributes(session);
    var repromptText = null;
    var shouldEndSession = false;
    var speechOutput = "I have added your clothes";

    sessionAttributes.clothes.push(intent.slots.Clothes.value);

    // Setting repromptText to null signifies that we do not want to reprompt the user.
    // If the user does not respond or says something that is not understood, the session
    // will end.
    callback(sessionAttributes,
         buildSpeechletResponse(intent.name, speechOutput, repromptText, shouldEndSession));
}

function getSessionAttributes(session) {
    var attributes = session.attributes;
    if (!attributes) {
        attributes = {};
    }
    if (typeof attributes.info === "undefined") {
        attributes.info = {};
    }
    if (typeof attributes.clothes === "undefined") {
        attributes.clothes = [];
    }
    return attributes;
}

// --------------- Helpers that build all of the responses -----------------------

function buildSpeechletResponse(title, output, repromptText, shouldEndSession) {
    return {
        outputSpeech: {
            type: "PlainText",
            text: output
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
