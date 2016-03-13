require("./Lookups");

Helpers.buildResponse = function(sessionAttributes, speechletResponse) {
    return {
        version: "1.0",
        sessionAttributes: sessionAttributes,
        response: speechletResponse
    };
};

Helpers.buildSpeechletResponse = function(title, output, repromptText, shouldEndSession) {
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
};

Helpers.parseClothes = function(text){
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

module.exports = Helpers;
