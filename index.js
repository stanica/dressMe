var http = require('http');
var mysql = require('mysql');
var conn  = mysql.createConnection({
    user:     'root',
    password: 'trescommas',
    database: 'dress_me',
    host:     'stylist.chieibkxkucz.us-east-1.rds.amazonaws.com',
    port:     3306
});

/*
 * Route the incoming request based on type (LaunchRequest, IntentRequest,
 * etc.) The JSON body of the request is provided in the event parameter.
 */
exports.handler = function (event, context) {
    try {
        var callback = function (sessionAttributes, speechletResponse) {
            conn.end();
            context.succeed(
                buildResponse(sessionAttributes, speechletResponse)
            );
        };

        conn.connect(function(error){

            if (error !== null){
                console.log(error);
                context.fail(error);
            }
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
                console.log("test-2");
                context.succeed();
            }
        });
    } catch (err) {
        console.log("test-3");
        context.fail(err);
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

    lastIntent = session.attributes.lastIntentHolder;
    session.attributes.lastIntent = lastIntent;
    session.attributes.lastIntentHolder = intentName;

    switch (intentName) {
        case "PositiveIntent":
            if (lastIntent in ["DressMeDefault", "DressMeSituation", "DressMeSituation"]) {
            handleDressMeReflectIntent("positive", intent, session, callback);
            }
            break;

        case "NegativeIntent":
            if (lastIntent in ["DressMeDefault", "DressMeSituation", "DressMeSituation"]) {
                handleDressMeReflectIntent("negative", intent, session, callback);
            }
            break;

        case "SkipIntent":
            if (lastIntent in ["DressMeDefault", "DressMeSituation", "DressMeSituation"]) {
                handleDressMeReflectIntent("skip", intent, session, callback);
            }
            break;

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
function findCombination(result, out, intent, session, callback) {
    console.log("combination");
    out += "your " + result.color + " " + result.description + " " +
           result.type;

    if (result.fullbody) {
        callback(session,
                 buildSpeechletResponse(intent.name, out, null, false));
    } else {

        var q = "SELECT * FROM bottoms;";
        var rows = [];
        var error = [""];

        conn.query(q).on('error', function(err){
            error[0] = err;
        }).on('result', function(row) {
            rows.push(row);
        }).on('end', function() {
            if (error[0] !== "") {
                var err = error[0];
                console.log(err);
                callback(session,
                         buildSpeechletResponse(intent.name, "Error", null, false));
            } else {
                if (result.combination && result.combination != "{}") {
                    json = JSON.parse(result.combination);
                    for (var i = 0; i < rows.length; i++) {
                        if (json[rows[i].id]) {
                            for (var j = 0; j < json[rows[i].id]; j++) {
                                rows.push(rows[i].id);
                            }
                        }
                    }
                }

                var bottom = rows[Math.floor(Math.random() * rows.length)];
                out += " together with your " + bottom.color + " " +
                       bottom.description + " " + bottom.type + ".";

                session.lastcombo = {
                    idTop:    result.id,
                    idBottom: bottom.id
                };

                callback(session,
                         buildSpeechletResponse(intent.name, out, null, false));
            }
        });
        // conn.query(q, function(err, rows, fields) {
        //     if (err) {
        //         console.log(err);
        //          throw err;
        //      }
        //
        //     if (result.combination && result.combination != "{}") {
        //         json = JSON.parse(result.combination);
        //         for (var i = 0; i < rows.length; i++) {
        //             if (json[rows[i].id]) {
        //                 for (var j = 0; j < json[rows[i].id]; j++) {
        //                     rows.push(rows[i].id);
        //                 }
        //             }
        //         }
        //     }
        //
        //
        //     var bottom = rows[Math.floor(Math.random() * rows.length)];
        //     out += " together with your " + bottom.color + " " +
        //            bottom.description + " " + bottom.type + ".";
        //
        //     session.lastcombo = {
        //         idTop:    result.id,
        //         idBottom: bottom.id
        //     }
        //
        //     callback(session,
        //              buildSpeechletResponse(intent.name, out, null, false));
        // });
    }
}

function handleDressMeReflectIntent(reflect, intent, session, callback) {
    //reflect: positive, negative, skip
    console.log("LOL");
    var sessionAttributes = getSessionAttributes(session);
    var cardTitle         = intent.name;
    var speechOutput      = reflect;
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
 * Main DressMe handler
 */
function handleDressMe(situation, description, intent, session, callback) {
    var sessionAttributes = getSessionAttributes(session);
    var repromptText      = null;
    var shouldEndSession  = false;
    var speechOutput      = "What about ";

    var q = "SELECT * FROM tops ORDER BY RAND() LIMIT 1;";
    conn.query(q, function(err, rows, fields) {
        if (err !== null) {
            console.log(err);
            throw err;
        }
        findCombination(rows[0], speechOutput, intent, sessionAttributes,
                        callback);
    });
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
    var parsed            = parseClothes(intent.slots.Clothes.value);
    var details           = clothes[parsed.article];
    var fullbody          = false;

    if (parsed.article === "all") {
        fullbody       = true;
        parsed.article = "tops";
    }

    var q = "INSERT INTO " + details[0] + " (" +
            "id, description, type, color, min_temp, max_temp, fullbody, " +
            "style) VALUES (0, \"" + parsed.description.join(" ") + "\", \"" +
            parsed.article + "\", \"" + parsed.color + "\", " +
            details[1] + ", " + details[2] + ", " + fullbody + ", " +
            "\"casual\");";

    conn.query(q, function(err, rows, fields) {
        if (err) throw err;
        callback(sessionAttributes,
                 buildSpeechletResponse(intent.name, "", null, false));
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

        callback(sessionAttributes,
             buildSpeechletResponse(intent.name, speechOutput, repromptText, shouldEndSession));
    });

}

function getSessionAttributes(session) {
    var attributes = session.attributes;
    if (typeof attributes === "undefined") attributes = {};
    if (typeof attributes.info === "undefined") attributes.info = {};
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

var colorQualifiers = ["light", "dark", "pale"];

var clothes = {
    //top
    'tank top': ["tops",  20, 45],
    't shirt': ["tops", 20, 45],
    'tee': ["tops", 20, 45],
    'shirt':["tops", 20, 45],
    'long sleeves shirt': ["tops", 10, 20],
    'long sleeve shirt': ["tops", 10, 20],
    'long sleeved shirt': ["tops", 10, 20],
    'long sleeve dress shirt': ["tops", 10, 20],
    'long sleeves dress shirt': ["tops", 10, 20],
    'long sleeved dress shirt': ["tops", 10, 20],
    'blouse': ["tops", 10, 20],
    'sweater': ["tops", 0, 10],
    'sweatshirt': ["tops", 10, 20],
    'dress shirt': ["tops", -30, 20],
    'dress T shirt': ["tops", 20, 45],
    'polo': ["tops", 20, 45],
    'crop top': ["tops", 20, 45],
    'halter top': ["tops", 20, 45],
    'tube top': ["tops", 20, 45],
    'sports bra': ["tops", 30, 45],

    //layer1
    'sweater': ["layers", 0, 10],
    'poncho': ["layers", 30, 45],
    'sweater vest': ["layers", 10, 20],
    'vest': ["layers", 10, 20],
    'cardigan': ["layers", 0, 20],

    //bottom
    'jeans': ["bottoms", -30, 20],
    'mini skirt': ["bottoms", 20, 30],
    'skirt': ["bottoms", 10, 20],
    'pants': ["bottoms", -30, 20],
    'trousers': ["bottoms", -30, 20],
    'slacks': ["bottoms", 0, 20],
    'shorts': ["bottoms", 20, 45],
    'dress pants': ["bottoms", 0, 20],
    'capri pants': ["bottoms", 0, 20],
    'overalls': ["bottoms", -30, 0],
    'yoga pants': ["bottoms", 10, 20],
    'leather pants': ["bottoms", 0, 10],
    'snow pants': ["bottoms", -30, -20],
    'track pants': ["bottoms", 10, 30],
    'dress pants': ["bottoms", -10, 30],
    'sweatpants': ["bottoms", 10, 30],
    'sweats': ["bottoms", 10, 30],

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
    var colorIndex, descriptionIndex, articleIndex;
    var inIndex = parsedText.indexOf("in");

    if(inIndex > -1){
        colorIndex = parsedText.indexOf("in") + 1;
        articleIndex = parsedText.indexOf("in");
    } else {
        colorIndex = 0;
        articleIndex = parsedText.length;
        descriptionIndex = articleIndex;
    }
    if (colorQualifiers.indexOf(parsedText[colorIndex]) > -1)
        color = parsedText[colorIndex] + " "  + parsedText[colorIndex+1];
    else
        color = parsedText[colorIndex];

    if(clothes.hasOwnProperty(parsedText[articleIndex - 4] + " " + parsedText[articleIndex - 3] + " " + parsedText[articleIndex - 2] + " " + parsedText[articleIndex - 1]))
        article = parsedText[articleIndex - 4] + " " + parsedText[articleIndex - 3] + " " + parsedText[articleIndex - 2] + " " + parsedText[articleIndex- 1];
    else if(clothes.hasOwnProperty(parsedText[articleIndex - 3] + " " + parsedText[articleIndex - 2] + " " + parsedText[articleIndex - 1]))
        article = parsedText[articleIndex - 3] + " " + parsedText[articleIndex - 2] + " " + parsedText[articleIndex - 1];
    else if(clothes.hasOwnProperty(parsedText[articleIndex - 2] + " " + parsedText[articleIndex - 1]))
        article = parsedText[articleIndex - 2] + " " + parsedText[articleIndex - 1];
    else if (clothes.hasOwnProperty(parsedText[articleIndex - 1]))
        article = parsedText[articleIndex - 1];
    else
        article = "Error";

    if (inIndex === -1)
        description = parsedText.slice(color.split(" ").length, descriptionIndex - article.split(" ").length);
    else{
        description = parsedText.slice(0, inIndex - article.split(" ").length);
    }

    return {
        'color': color,
        'description': description,
        'article': article
    }
}
