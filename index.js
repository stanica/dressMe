/*
 * Route the incoming request based on type (LaunchRequest, IntentRequest,
 * etc.) The JSON body of the request is provided in the event parameter.
 */
exports.handler = function (event, context) {
    var callback = function (sessionAttributes, speechletResponse) {
        context.succeed(buildResponse(sessionAttributes, speechletResponse));
    };

    /*if (event.session.application.applicationId !== "amzn1.echo-sdk-ams.app.[unique-value-here]") {
         context.fail("Invalid Application ID");
    }*/

    if (event.request.type === "LaunchRequest") {
        getWelcomeResponse(callback);
    }

    if (event.request.type === "IntentRequest") {
        onIntent(event.request, event.session, callback)
    }

    if (event.request.type === "SessionEndedRequest") {
        context.succeed();
    }
};

/*
 * Called when the user specifies an intent for this skill.
 */
function onIntent(intentRequest, session, callback) {
    session.attributes                = getSessionAttributes(session);
    session.attributes.expectedIntent = sessionAttributes.nextIntent;
    session.attributes.nextIntent     = null;

    switch (intentRequest.intent.name) {
        case "RandomIntent":
            handleRandomIntent(IntentRequest.intent, session, callback);
            break;

        case "SetName":
            setName(IntentRequest.intent, session, callback);
            break;

        case "GetSelfInfo":
            getSelfInfo(IntentRequest.intent, session, callback);
            break;

        case "DressMeDefault":
            handleDressMe("normal", "normal",  intent, session, callback);
            break;

        case "DressMeSituation":
            handleDressMe(intent.slots.Situation.value, "normal",  intent,
                          session, callback);
            break;

        case "DressMeDescription":
            handleDressMe("normal", intent.slots.Description.value,  intent,
                          session, callback);
            break;

        case "AMAZON.HelpIntent":
            getWelcomeResponse(callback);
            break;

        default:
            context.fail("Invalid Intent");
    }
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
        sessionAttributes,
        buildSpeechletResponse(
            cardTitle, speechOutput, repromptText, shouldEndSession
        )
    );
}

function handleRandomIntent(intent, session, callback) {
    var sessionAttributes = getSessionAttributes(session);
    var cardTitle         = intent.name;
    var speechOutput      = "Echo " + randomIntent.value;
    var repromptText      = "";
    var shouldEndSession  = false;
    var randomIntent      = intent.slots.Intent

    console.log(randomIntent.value)

    callback(
        sessionAttributes,
        buildSpeechletResponse(
            cardTitle, speechOutput, repromptText, shouldEndSession
        )
    );
}

/*
 * sets the name of the user
 */
function setName(intent, session, callback) {
    var sessionAttributes = getSessionAttributes(session);
    var cardTitle         = intent.name;
    var repromptText      = "";
    var shouldEndSession  = false;
    var speechOutput      = "";

    if (intent.slots.Name) {
        sessionAttributes.info.name = intent.slots.Name.value;

        if (sessionAttributes.info.color) {
            speechOutput = "Say Dress me or add new clothes";
            repromptText = "Add clothes";
        } else {
            speechOutput = "What is your favorite color?";
            repromptText = "You can tell me your favorite color by saying, " +
                           "my favorite color is red";
        }

    } else {
        speechOutput = "I'm not sure what your favorite color is. Please try " +
                       "again";
        repromptText = "I'm not sure what your favorite color is. You can " +
                       "tell me your favorite color by saying, my favorite " +
                       "color is red";
    }

    callback(
        sessionAttributes,
        buildSpeechletResponse(
            cardTitle, speechOutput, repromptText, shouldEndSession
        )
    );
}

/*
 * retrieves personal information
 */
function getSelfInfo(intent, session, callback) {
    var sessionAttributes = getSessionAttributes(session);
    var repromptText      = null;
    var shouldEndSession  = false;
    var speechOutput      = "";
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
        speechOutput = "I don't know much about you. Tell me about yourself. " +
                       "What is your favorite color?"
    }

    callback(
        sessionAttributes,
        buildSpeechletResponse(
            intent.name, speechOutput, repromptText, shouldEndSession
        )
    );
}

/*
 * Main DresMe handler
 */
function handleDressMe(situation, description, intent, session, callback) {
    var sessionAttributes = getSessionAttributes(session);
    var repromptText      = null;
    var shouldEndSession  = false;
    var speechOutput      = "It is 22 degrees outside. Clothes for " +
                            situation + " and " + description + " are white " +
                            "H and M tank top and your brown Banana Republic " +
                            "shorts.";

    console.log(situation, description);

    callback(
        sessionAttributes,
        buildSpeechletResponse(
            intent.name, speechOutput, repromptText, shouldEndSession
        )
    );
}

// --------------- Helper functions -----------------------

function getSessionAttributes(session) {
    var attributes = session.attributes;
    if (!attributes) attributes = {};
    if (typeof attributes.info === "undefined") attributes.info = {};
    return attributes;
}

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

