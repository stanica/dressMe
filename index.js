require("./Helpers");
require("./Lookups");

var mysql = require('mysql');
var conn  = mysql.createConnection({
    user:     'root',
    password: 'trescommas',
    database: 'dress_me',
    host:     'stylist.chieibkxkucz.us-east-1.rds.amazonaws.com',
    port:     3306
});

/*
 * Adds clothes to the database
 */
function addClothes(intent, session, cb) {
    var parsed   = parseClothes(intent.slots.Clothes.value);
    var details  = clothes[parsed.article];
    var fullbody = false;

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
        cb(session, buildSpeechletResponse(intent.name, "Got it", null, false));
    });
}

/*
 * Generation of an outfit starts here
 */
function dressMe(intent, session, callback) {
    var q = "SELECT * FROM tops ORDER BY RAND() LIMIT 1;";
    conn.query(q, function(err, rows, fields) {
        if (err) throw err;
        findCombination(rows[0], "What about ", intent, session, callback);
    });
}

/*
 * Fancy algorithm, markov chain and stuff...
 */
function findCombination(result, out, intent, session, cb) {
    out += "your " + result.color + " " + result.description + " " +
           result.type;

    if (result.fullbody) {
        cb(session, buildSpeechletResponse(intent.name, out, null, false));
    }

    conn.query(q, function(err, rows, fields) {
        if (err) throw err;

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

        cb(session, buildSpeechletResponse(intent.name, out, null, false));
    }
}

function handleAnswers(intent, session, cb) {
     cb(session, buildSpeechletResponse(intent.name, "Temp", null, false));
}

/*
 * Main Event handler
 */
function handleEvents(event, cb) {
    var intent = event.request.intent;

    switch (intent.name) {
        case "AddClothes":
            addClothes(intent, event.session, cb);
            break;

        case "DressMeDefault":
        case "DressMeSituation":
        case "DressMeDescription":
            dressMe(intent, event.session, cb);

        case "PositiveIntent":
        case "NegativeIntent":
        case "SkipIntent":
            handleAnswers(intent, event.session, cb);

        default:
            throw "Invalid Intent"
    }
}

/*
 * Route the incoming request based on type (LaunchRequest, IntentRequest,
 * etc.) The JSON body of the request is provided in the event parameter.
 */
exports.handler = function (event, context) {
    if (event.request.type === "SessionEndedRequest") context.succeed();

    try {
        handleEvents(event, function(session, response) {
            conext.succeed(buildResponse(session.attributes, response));
        });
    } catch (err) {
        context.fail(err);
    }
};

