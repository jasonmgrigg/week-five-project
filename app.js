const express = require('express');
const expressValidator = require('express-validator');
const mustacheExpress = require('mustache-express');
const bodyParser = require('body-parser');
const session = require('express-session');
const sessionConfig = require("./sessionCounter");
//needed for file-system to work
const fs = require('file-system');
const app = express();
const words = fs.readFileSync("/usr/share/dict/words", "utf-8").toLowerCase().split("\n");

//Functions to get words from local file.

function getWord() {
  let randomWord;
  let wordLength = 0;
  let wordFound = false;

  while (!wordFound) {
    //Random word generator
    let randomNumber = Math.floor((Math.random() * words.length-1) + 1)
    randomWord = words[randomNumber];
    wordLength = randomWord.length;
          wordFound = true;
          break;
  }
  console.log(randomWord);
  //returns random word that was chosen
  return randomWord.toUpperCase();  //changing word to upper case
};

function play(game) {
  var showText = [];
  //starts the game playing
  for (let i = 0; i < game.word.length; i++) {  //function to cycle through word array to find word.
    if (game.lettersGuessed.indexOf(game.word[i]) > -1) {
       showText.push(game.word[i].toUpperCase());  //pushes the game.word(word randomly chosen), into the showText array
     } else {
       if (game.lose == true) {
          showText.push(game.word[i].toUpperCase()); //displays letters in boxes, if lose game display all.
          console.log("showText is " + showText);
       } else {
          showText.push(' '); //pushes empty array of characters into the showText array
       }
     }
  }
  console.log(showText)
  return showText;
};
//End Functions

app.engine("mustache", mustacheExpress());
app.set("views", "./public");
app.set("view engine", "mustache");

app.use("/", express.static("./public"));
app.use(bodyParser.urlencoded({extended: false}));
app.use(expressValidator());
app.use(session(sessionConfig));  //found code to make this work, still not sure why I had to have it

app.use(function (req, res, next) {  //sending code to mustache file to render on display
  var game = req.session.game;
  console.log(game);  //shows the below variables and how they are defined in the beginning of the game.
  if (!game) {
    game = req.session.game = {};  //empty array
    game.guessesLeft = 8;  //chances left to guess a letter
    game.lettersGuessed = [];  //this is an empty array since nothing has been guessed at this point.
    game.btnText = 'Play game';  //text that is dislayed in the button
    game.status = '';  //game status display, which is nothing at this time
    game.lose = false;  //boolean to see if game has been lost to trigger another action
    game.playing = false;
    game.display = '';
  }
  next();
});

app.get('/', function(req, res) {
  if (req.session.game.playing || req.session.game.btnText != 'Play game') {
    req.session.game.display = play(req.session.game);
  }
  res.render('index', { game: req.session.game });
});

app.post('/', function(req, res) {
  var game = req.session.game;
  if (game.playing) {
    req.checkBody("guessLetter", "You must enter a letter!").notEmpty().isAlpha();
    var errors = req.validationErrors();
    if (errors) {
      game.message = errors[0].msg;
    } else {
      if (game.lettersGuessed.indexOf(req.body.guessLetter.toUpperCase()) > -1) {
        game.message = 'You already guessed letter ' + req.body.guessLetter.toUpperCase();;
      } else {
        var n = game.word.indexOf(req.body.guessLetter.toUpperCase());
        if (n == -1) {
          game.message = 'Bad guess...try again!';
          game.guessesLeft -= 1;
          game.lettersGuessed.push(req.body.guessLetter.toUpperCase());
          if (game.guessesLeft == 0) {
            game.btnText = 'Try again';
            game.status = 'You lose!';
            game.playing = false;
            game.lose = true;
          }
        } else {
          game.lettersGuessed.push(req.body.guessLetter.toUpperCase());
          game.message = '';
          // check for win ---------------------------
          req.session.game.display = play(req.session.game);
          if (game.display.indexOf(' ') ==  -1) {
            game.btnText = 'Try again';
            game.status = 'You win!';
            game.playing = false;
            game.lose = false;
          }
        }
      }
    }
  } else {
    game.playing = true;
    game.btnText = "Make a guess";
    game.word = getWord(game.mode);
    game.lose = false;
    game.guessesLeft = 8;
    game.lettersGuessed = [];
  }

  res.redirect('/');
});





app.listen(3000, function(){
  console.log('Started express application!')
});
