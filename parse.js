var colorQualifiers = ["light", "dark", "pale"];

var clothes = {
	//top
	'tank top': ["top", "casual", 20, 45],
	't shirt': ["top", "casual", 20, 45],
	'tee': ["top", "casual", 20, 45],
	'long sleeves shirt': ["top", "casual", 10, 20],
	'blouse': ["top", "semi formal", 10, 20],
	'sweater': ["top", "semi formal", 0, 10],
	'sweatshirt': ["top", "casual", 10, 20],
	'dress shirt': ["top", "formal", -30, 20],
	'dress t shirt': ["top", "semi formal", 20, 45],
	'polo': ["top", "business casual", 20, 45],
	'crop top': ["top", "casual", 20, 45],
	'halter top': ["top", "casual", 20, 45],
	'tupe top': ["top", "casual", 20, 45],
	'sports bra': ["top", "casual", 30, 45],
	
	
	//layer1
	'sweater': ["top", "business casual", 0, 10],
	'poncho': ["top", "casual", 30, 45],
	'sweater vest': ["top", "semi formal", 10, 20],
	'vest': ["top", "formal", 10, 20],
	'cardigan': ["top", "business casual", 0, 20],
	
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

function parseClothes(text){
  text = text.toLowerCase().replace('.', '');
  var color, description, article;
  var parsedText = text.split(" ");
  var colorIndex, descriptionIndex, articleIndex;
  var inIndex = parsedText.indexOf("in");

  if(inIndex > -1){
    colorIndex = parsedText.indexOf("in") + 1;
    articleIndex = parsedText.indexOf("in");
    
  }
  else {
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
    else if (clothes.has OwnProperty(parsedText[articleIndex - 1]))
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