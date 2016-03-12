var colorQualifiers = ["light", "dark", "pale"];

var clothes = {
	//top
	'tank top': ["top", "casual", 20, 45],
	't shirt': ["top", "casual", 20, 45],
	'tee': ["top", "casual", 20, 45],
  'long sleeve shirt': ["top", "casual", 10, 20],
	'long sleeves shirt': ["top", "casual", 10, 20],
  'long sleeved shirt': ["top", "casual", 10, 20],
  'long sleeve dress shirt': ["top", "casual", 10, 20],
  'long sleeves dress shirt': ["top", "casual", 10, 20],
  'long sleeved dress shirt': ["top", "casual", 10, 20],
	'blouse': ["top", "semi formal", 10, 20],
	'sweater': ["top", "semi formal", 0, 10],
	'sweatshirt': ["top", "casual", 10, 20],
	'dress shirt': ["top", "formal", -30, 20],
	'dress t shirt': ["top", "semi formal", 20, 45],
	'polo': ["top", "semi-formal", 20, 45],
	'crop top': ["top", "casual", 20, 45],
	'halter top': ["top", "casual", 20, 45],
	'tube top': ["top", "casual", 20, 45],
	'sports bra': ["top", "casual", 30, 45],
	
	
	//layer1
	'sweater': ["top", "semi-formal", 0, 10],
	'poncho': ["top", "casual", 30, 45],
	'sweater vest': ["top", "semi formal", 10, 20],
	'vest': ["top", "formal", 10, 20],
	'cardigan': ["top", "semi-formal", 0, 20],
	
	//bottom
	'jeans': ["bottom", "casual", -30, 20],
	'mini skirt': ["bottom", "casual", 20, 30],
	'skirt': ["bottom", "semi formal", 10, 20],
	'pants': ["bottom", "semi formal", -30, 20],
	'trousers': ["bottom", "semi formal", -30, 20],
	'slacks': ["bottom","casual", 0, 20],
	'shorts': ["bottom", "casual", 20, 45],
	'dress pants': ["bottom", "formal", 0, 20],
	'capri pants': ["bottom", "casual", 0, 20],
	'overalls': ["bottom", "casual", -30, 0],
	'yoga pants': ["bottom", "casual", 10, 20],
	'leather pants': ["bottom", "casual", 0, 10],
	'snow pants': ["bottom", "casual", -30, -20],
	'track pants': ["bottom", "casual", 10, 30],
	'dress pants': ["bottom", -10, 30],
	
	//all
	'dress': ["all", "formal", -20, 20],
	'short dress': ["all", "semi formal", 0, 20],
	'gown': ["all", "formal", -30, 20],
}

var parse = function (text){
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