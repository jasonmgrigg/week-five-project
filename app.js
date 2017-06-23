// String length, work out something to randomly select word and then define
// the length.
// Use that to determine how many search boxes(letter boxes) to put up
// var str = "Hello World!";
// var n = str.length;
// console.log(n)


const express = require('express');
const path = require('path');
const list = require('./data.js');
const clist = require('./completedList.js');
const mustacheExpress = require('mustache-express');
var bodyParser = require('body-parser');
const app = express();

app.engine('mustache', mustacheExpress());
app.set('views', './views')
app.set('view engine', 'mustache')
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

function pushToArray(string, num){
  let tempTask = {'item': string,
"id":''+num};
  return tempTask;
}

function onClick() {

}

app.get('/todo/', function (req, res) {

  res.render('todo', {todoList: list.todoList,
  completedList: clist.completedList})
});

app.post('/', function(req, res){
  let num = list.todoList.length;
  let nextTask = pushToArray(req.body.todo, num);
  list.todoList.push(nextTask);


  res.redirect('/todo');

  });

app.listen(3000, function(){
  console.log('Started express application!')
});
