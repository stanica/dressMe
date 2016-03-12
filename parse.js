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
  text = text.toLowerCase();
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