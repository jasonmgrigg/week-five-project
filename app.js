//Change guesses back to 8 from 1 before submission














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
  // console.log(randomWord);
  //returns random word that was chosen
  return randomWord.toUpperCase();  //changing word to upper case
};

function play(wordChance) {
  var showText = [];
  //starts the game playing
  for (let i = 0; i < wordChance.word.length; i++) {  //function to cycle through word array to find word.
    if (wordChance.lettersGuessed.indexOf(wordChance.word[i]) > -1) { //indexOf checks for the occurence of the string in a position
       showText.push(wordChance.word[i].toUpperCase());  //pushes the game.word(word randomly chosen), into the showText array
     } else {
       if (wordChance.lose == true) {
          showText.push(wordChance.word[i].toUpperCase()); //displays letters in boxes, if lose game display all.
       } else {
          showText.push(' '); //pushes empty array of characters into the showText array
       }
     }
  }
  // console.log(showText)
  return showText;
};
//End Functions


//setting routes
app.engine("mustache", mustacheExpress());
app.set("views", "./public");
app.set("view engine", "mustache");

app.use("/", express.static("./public"));
app.use(bodyParser.urlencoded({extended: false}));
app.use(expressValidator());
app.use(session(sessionConfig));  //found code to make this work, still not sure why I had to have it

app.use(function (req, res, next) {  //setting route
  var wordChance = req.session.wordChance;
  // console.log(wordChance);  //shows the below variables and how they are defined in the beginning of the game.
  if (!wordChance) {
    wordChance = req.session.wordChance = {};  //empty array
    wordChance.guessesLeft = 8;  //chances left to guess a letter
    wordChance.lettersGuessed = [];  //this is an empty array since nothing has been guessed at this point.
    wordChance.btnText = 'Play Game';  //text that is dislayed in the button
    wordChance.status = '';  //game status display, which is nothing at this time
    wordChance.lose = false;  //boolean to see if game has been lost to trigger another action
    wordChance.playing = false;
    wordChance.display = ''; //displays an empty string to start
  }
  next();
});

app.get('/', function(req, res) {
  if (req.session.wordChance.playing) {
    req.session.wordChance.display = play(req.session.wordChance);  //starts the game off playing
  }
  res.render('index', { wordChance: req.session.wordChance }); //renders the index.mustache file to begin, passes in wordChance function
});
app.post('/', function(req, res) {
  var wordChance = req.session.wordChance;
  if (wordChance.playing) {
    req.checkBody("guessLetter", "You must enter a letter!").notEmpty();  //checks for alpha character, if not returns error.
    var errors = req.validationErrors();
    if (errors) {
      wordChance.message = errors[0].msg;
    } else {
      if (wordChance.lettersGuessed.indexOf(req.body.guessLetter.toUpperCase()) > -1) {
        wordChance.message = 'You already guessed letter ' + req.body.guessLetter.toUpperCase();;  //checks to see if letter was entered previously
      } else {
        var n = wordChance.word.indexOf(req.body.guessLetter.toUpperCase());
        if (n == -1) {
          wordChance.message = 'Bad guess...try again!';  //if letter is not in the words, returns this error and starts again
          wordChance.guessesLeft -= 1;  //sets the guesses to a value minus the previous guess
          wordChance.lettersGuessed.push(req.body.guessLetter.toUpperCase());  // pushes capital letter into the lettersGuessed array
          if (wordChance.guessesLeft == 0) {  //checks to see if you have any guesses left, if they are equal to 0 then the game ends
            wordChance.status = 'You lose!'; //status changes to you lose, cannot guess any more letters
            wordChance.display = req.session.wordChance.word;
            wordChance.playing = false;
            wordChance.lose = true;
            // console.log(req.session.wordChance.word);
          }
        } else {
          wordChance.lettersGuessed.push(req.body.guessLetter.toUpperCase());  //if game is not over, push guessed letter into lettersGuessed arrray
          wordChance.message = '';
          req.session.wordChance.display = play(req.session.wordChance);  //displays letters that are chosen in display boxes
          if (wordChance.display.indexOf(' ') ==  -1) { //looks for a blank string, if it's not there you win
            wordChance.status = 'You win!';  //changes game status to win
            wordChance.playing = false;
            wordChance.lose = false;
            wordChance.btnText = req.session.wordChance.status;
          }
        }
      }
    }
  } else {  //Game Reset
    wordChance.playing = true;
    // starts game back over
    wordChance.word = getWord(wordChance.mode);
    wordChance.lose = false;
    wordChance.guessesLeft = 8;
    wordChance.lettersGuessed = [];
    wordChance.btnText = 'Play Game';  //resets Button to display Play Game after reset
  }

  res.redirect('/');
});





app.listen(3000, function(){
  console.log('Started express application!')
});
