var suggestOutfit = function() {
  var voteValue = 1;
  var top = tops[Math.floor(Math.random() * tops.length)];
  var bot;
  if (countObjectProperties(top.combination) === 0) {
    bot = bots[Math.floor(Math.random() * bots.length)];
    console.log("Outfit is " + top.color + " " + top.description + " " + top.article + " with " + bot.color + " " + bot.description + " " + bot.article);
  }
  else {
    var tempBotArray = [];
    for (var x=0; x<bots.length; x++){
      if(top.combination[bots[x].id]){
        for (var y=0; y<top.combination[bots[x].id]; y++){
          tempBotArray.push(bots[x].id);
        }
      }
      else {
        tempBotArray.push(bots[x].id);
      }
    }
    botId = tempBotArray[Math.floor(Math.random() * tempBotArray.length)];
    for(var x=0; x<bots.length; x++){
      if (bots[x].id === botId)
        bot = bots[x];
    }
    console.log("You outfit is " + top.color + " " + top.description + " " + top.article + " with " + bot.color + " " + bot.description + " " + bot.article);
  }
}

function doShit(responseText){
  var response;
  console.log(responseText);
  for (var x=0; x<responses.length; x++){
    if (responses[x].response === responseText){
      response = responses[x];
    }
  }
   if (top.combination[bot.id]) {
    //console.log("exists");
    if (response.value > 0) {
      top.combination[bot.id] = top.combination[bot.id] + response.value;
    }
    else {
      if (response.value < 0 && top.combination[bot.id] + response.value > 1){
        top.combination[bot.id] = top.combination[bot.id] + response.value;
      }
      else {
        delete top.combination[bot.id];
      }
    }
    //console.log(top.combination);
  } else {
    //console.log("does not exist");
    if(response.value > 0){
      top.combination[bot.id] = response.value;
      //console.log('top ' + top.article + ' has ' + bot.article + ': ' + top.combination[bot.id]);
    }
  }
  suggestOutfit();
}

function countObjectProperties(obj)
{
    var count = 0;
    for(var i in obj)
        if(obj.hasOwnProperty(i))
            count++;

    return count;
}