var helpers = require("./helpers.js");
var lookup  = require("./lookups.js");
var mysql   = require('mysql');

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
    var parsed   = helpers.parseClothes(intent.slots.Clothes.value);
    var details  = lookup.clothes[parsed.article];
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
        cb(session, helpers.speechlet(intent.name, "Got it", null, false));
    });
}

/*
 * Changes the Markov rating in the database
 */
function adjustMarkov(session, value, intent, out, cb) {
    var q = "SELECT * FROM tops WHERE id=" +
        session.attributes.lastcombo.idTop + ";";
    conn.query(q, function(err, rows, fields) {
        if (err) throw err;
        if (!rows[0].combination) rows[0].combination = '{}';

        var key = session.attributes.lastcombo.idBottom;

        json = JSON.parse(rows[0].combination);
        if (!json[key]) json[key] = 0;
        json[key] += value;
        if (json[key] < 0) json[key] = 0;

        q = "UPDATE tops SET combination=\"" +
            conn.escape(JSON.stringify(json)) + "\" WHERE id=" +
            session.attributes.lastcombo.idTop + ";";
        conn.query(q, function(err, rows, fields) {
            if (err) throw err;
            if (out && cb && intent) {
                cb(session, helpers.speechlet(intent.name, out, null, false));
            }
        });
    });
}

/*
 * Generation of an outfit starts here
 */
function dressMe(answer, intent, session, callback) {
    var q = "SELECT * FROM tops ORDER BY RAND() LIMIT 1;";
    conn.query(q, function(err, rows, fields) {
        if (err) throw err;
        findCombination(rows[0], answer, intent, session, callback);
    });
}

/*
 * Fancy algorithm, markov chain and stuff...
 */
function findCombination(result, out, intent, session, cb) {
    var add = "your " + result.color + " " + result.description + " " +
              result.type;

    if (result.fullbody) {
        cb(session, helpers.speechlet(intent.name, out + add, null, false));
    }

    var q = "SELECT * FROM bottoms;";
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

        if (!session.attributes.lastcombo) session.attributes.lastcombo = {};

        if (result.id === session.attributes.lastcombo.idTop &&
            bottom.id === session.attributes.lastcombo.idBottom) {
            dressMe(out, intent, session, cb)
        }

        out += add + " together with your " + bottom.color + " " +
               bottom.description + " " + bottom.type + ".";

        session.attributes.lastcombo = {
            idTop:    result.id,
            idBottom: bottom.id
        };

        cb(session, helpers.speechlet(intent.name, out, null, false));
    });
}

function handleAnswers(intent, session, cb) {
    if (session.attributes.lastIntent != "DressMeDefault" &&
        session.attributes.lastIntent != "DressMeSituation" &&
        session.attributes.lastIntent != "DressMeDescription" &&
        session.attributes.lastIntent != "NegativeIntent" &&
        session.attributes.lastIntent != "SkipIntent") {
        throw "Unexpected intent"
    }

    // Default is for skipping
    var out = "Got it, skipping this one for now. Let's try "

    switch (intent.name) {
        case "PositiveIntent":
            out = "I'm glad you like it."
            adjustMarkov(session, 5, intent, out, cb);
            break;

        case "NegativeIntent":
            out = "Ok, I will keep this in mind. Let's try another outfit. " +
                  "How about ";
            adjustMarkov(session, -5, null, null, null);
            break;

        // SkipIntent
        default:
            break;
    }

    dressMe(out, intent, session, cb);
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
            dressMe("What about ", intent, event.session, cb);
            break

        case "PositiveIntent":
        case "NegativeIntent":
        case "SkipIntent":
            handleAnswers(intent, event.session, cb);
            break;

        default:
            throw "Invalid Intent"
    }

    if (!event.session.attributes) event.session.attributes = {};
    event.session.attributes.lastIntent = intent.name;
}

/*
 * Route the incoming request based on type (LaunchRequest, IntentRequest,
 * etc.) The JSON body of the request is provided in the event parameter.
 */
exports.handler = function (event, context) {
    if (event.request.type === "SessionEndedRequest") context.succeed();
    try {
        handleEvents(event, function(session, response) {
            context.succeed(helpers.response(session.attributes, response));
        });
    } catch (err) {
        context.fail(err);
    }
};

