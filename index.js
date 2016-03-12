var postgres = require('pg');
var pg       = new postgres.Client("postgres://root:trescommas@dress-me.chieibkxkucz.us-east-1.rds.amazonaws.com:5432/dress_me");

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
    var intent = intentRequest.intent,
        intentName = intentRequest.intent.name;

    if (!session.attributes) session.attributes = {};
    session.attributes.expectedIntent = session.attributes.nextIntent;
    session.attributes.nextIntent = null;

    switch (intentRequest.intent.name) {
        case "RandomIntent":
            handleRandomIntent(intent, session, callback);
            break;

        case "SetName":
            setName(intent, session, callback);
            break;

        case "GetSelfInfo":
            getSelfInfo(intent, session, callback);
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

        case "AddClothes":
            handleAddClothes(intent, session, callback);
            break;

        case "ListAllClothes":
            handleListAllClothes(intent, session, callback);
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
    var repromptText      = "I'm not sure what your favorite color is. You " +
                            "can tell me your favorite color by saying, my " +
                            "favorite color is red";
    var speechOutput      = "I'm not sure what your favorite color is. " +
                            "Please try again";
    var shouldEndSession  = false;

    if (!intent.slot.Name) callback(
        sessionAttributes,
        buildSpeechletResponse(
            cardTitle, speechOutput, repromptText, shouldEndSession
        )
    );

    if (sessionAttributes.info.color) {
        speechOutput = "Say Dress me or add new clothes";
        repromptText = "Add clothes";
    } else {
        speechOutput = "What is your favorite color?";
        repromptText = "You can tell me your favorite color by saying, " +
                       "my favorite color is red";
    }

    sessionAttributes.info.name = intent.slots.Name.value;
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
 * Main algorithm, markov chain and stuff...
 */
function findCombination(result) {
    return "Hello World";
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

    pg.connect(conString, function(err) {
        if (err) context.fail("Database connection failed");
        pg.query('SELECT * FROM bottoms OFFSET floor(random()*N) LIMIT 1', [],
                 function(err, result) {
            if (err) context.fail("SQL query failed");
            speechOutput = findCombination(result);
            pg.end();
        });
    });

    callback(
        sessionAttributes,
        buildSpeechletResponse(
            intent.name, speechOutput, repromptText, shouldEndSession
        )
    );
}

function handleListAllClothes(intent, session, callback) {
    var sessionAttributes = getSessionAttributes(session);
    var repromptText = null;
    var shouldEndSession = false;
    var speechOutput = "";

    var l = sessionAttributes.clothes.length;
    if (l != 0) {
        for (var i = 0; i < l; i++) {
            var clothes = sessionAttributes.clothes[i];
            speechOutput += "<say-as interpret-as=\"ordinal\">" + (i+1) + "</say-as> " + clothes + ". ";
        }
    } else {
        speechOutput = "I don't have any of your clothes.";
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
    var parsedClothesInfo = parseClothes(intent.slots.Clothes.value);

    var speechOutput = "I have added your clothes. Color is " + parsedClothesInfo.color + ". Article type is " + parsedClothesInfo.article + ". Description is " + parsedClothesInfo.description.join(" ") + ".";
    sessionAttributes.clothes.push(intent.slots.Clothes.value);
    // Setting repromptText to null signifies that we do not want to reprompt the user.
    // If the user does not respond or says something that is not understood, the session
    // will end.
    callback(sessionAttributes,
         buildSpeechletResponse(intent.name, speechOutput, repromptText, shouldEndSession));
}

// --------------- Helper functions -----------------------
function getSessionAttributes(session) {
    var attributes = session.attributes;
    if (!attributes) attributes = {};
    if (typeof attributes.info === "undefined") attributes.info = {};
    if (typeof attributes.clothes === "undefined") attributes.clothes = [];
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

var colorQualifiers = ["light", "dark", "pale"];

var clothes = {
    //top
    'tank top': ["top",  20, 45],
    't shirt': ["top", 20, 45],
    'tee': ["top", 20, 45],
    'long sleeves shirt': ["top", 10, 20],
    'long sleeve shirt': ["top", 10, 20],
    'long sleeved shirt': ["top", 10, 20],
    'long sleeve dress shirt': ["top", 10, 20],
    'long sleeves dress shirt': ["top", 10, 20],
    'long sleeved dress shirt': ["top", 10, 20],
    'blouse': ["top", 10, 20],
    'sweater': ["top", 0, 10],
    'sweatshirt': ["top", 10, 20],
    'dress shirt': ["top", "formal", -30, 20],
    'dress T shirt': ["top", 20, 45],
    'polo': ["top", 20, 45],
    'crop top': ["top", 20, 45],
    'halter top': ["top", 20, 45],
    'tube top': ["top", 20, 45],
    'sports bra': ["top", 30, 45],

    //layer1
    'sweater': ["top", "semi-formal", 0, 10],
    'poncho': ["top", "casual", 30, 45],
    'sweater vest': ["top", "semi formal", 10, 20],
    'vest': ["top", "formal", 10, 20],
    'cardigan': ["top", "semi-formal", 0, 20],

    //bottom
    'jeans': ["bottom", -30, 20],
    'mini skirt': ["bottom", 20, 30],
    'skirt': ["bottom", 10, 20],
    'pants': ["bottom", -30, 20],
    'trousers': ["bottom", -30, 20],
    'slacks': ["bottom", 0, 20],
    'shorts': ["bottom", 20, 45],
    'dress pants': ["bottom", 0, 20],
    'capri pants': ["bottom", 0, 20],
    'overalls': ["bottom", -30, 0],
    'yoga pants': ["bottom", 10, 20],
    'leather pants': ["bottom", 0, 10],
    'snow pants': ["bottom", -30, -20],
    'track pants': ["bottom", 10, 30],
    'dress pants': ["bottom", -10, 30],
    'sweatpants': ["bottom", 10, 30],
    'sweats': ["bottom", 10, 30],

    //all
    'dress': ["all", -20, 20],
    'sundress': ["all", -20, 20],
    'slip dress': ["all", -20, 20],
    'strapless dress': ["all", -20, 20],
    'short dress': ["all", 0, 20],
    'gown': ["all", -30, 20],
}

function parseClothes(text){
  text = text.toLowerCase().replace('.', '');
  var color, description, article;
  var parsedText = text.split(" ");
    if (colorQualifiers.indexOf(parsedText[0]) > -1)
      color = parsedText[0] + " "  + parsedText[1];
    else
      color = parsedText[0];

    if(clothes.hasOwnProperty(parsedText[parsedText.length - 4] + " " + parsedText[parsedText.length - 3] + " " + parsedText[parsedText.length - 2] + " " + parsedText[parsedText.length - 1]))
      article = parsedText[parsedText.length - 4] + " " + parsedText[parsedText.length - 3] + " " + parsedText[parsedText.length - 2] + " " + parsedText[parsedText.length - 1];
    else if(clothes.hasOwnProperty(parsedText[parsedText.length - 3] + " " + parsedText[parsedText.length - 2] + " " + parsedText[parsedText.length - 1]))
       article = parsedText[parsedText.length - 3] + " " + parsedText[parsedText.length - 2] + " " + parsedText[parsedText.length - 1];
    else if(clothes.hasOwnProperty(parsedText[parsedText.length - 2] + " " + parsedText[parsedText.length - 1]))
      article = parsedText[parsedText.length - 2] + " " + parsedText[parsedText.length - 1];
    else if (clothes.hasOwnProperty(parsedText[parsedText.length - 1]))
      article = parsedText[parsedText.length - 1];
    else
      article = "Error";

    description = parsedText.slice(color.split(" ").length, parsedText.length - article.split(" ").length).join(" ");

  return {
    'color': color,
    'description': description.split(" "),
    'article': article
  }
}
