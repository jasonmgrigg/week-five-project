// Require dependencies.
const express = require('express');
const bodyParser = require('body-parser');
const expressValidator = require('express-validator');
const mustacheExpress = require('mustache-express');
const session = require('express-session')
const parseurl = require('parseurl')

// Create app.
const app = express();
// Instantiate letterList array.
const letterList = [];
const viewsList = [];
// Configure dependencies.
app.engine('mustache', mustacheExpress());
app.set('views', './views');
app.set('view engine', 'mustache');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(expressValidator());
app.use(express.static('./public'));
app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true
}))
app.use(function (req, res, next) {
  var views = req.session.views

  if (!views) {
    views = req.session.views = {}
  }


  // get the url pathname
    var pathname = parseurl(req).pathname

    // count the views
    views[pathname] = (views[pathname] || 0) + 1

    next()
    console.log(views)
  })

  app.get('/', function (req, res, next) {
    // res.send('you viewed this page ' + req.session.views['/'] + ' times')
    // res.render('index', {views: views});
//   })
//
//   app.get('/bar', function (req, res, next) {
//     res.send('you viewed this page ' + req.session.views['/bar'] + ' times')
//   })
//
// // Add route to render the To Do list on the index page.
// app.get('/', function(req, res){
  res.render('index', {letterList});
});

// Receives data from form (action='/')
// 'req.body' now contains form data.
app.post('/', function(req, res){
// Check for validation errors and create error message.
  req.checkBody('item', 'Please enter something to do.' ).notEmpty();

  let errors = req.validationErrors();
  if (errors) {
// Render validation error messages.
    res.render('index', {errors: errors});
  } else {
// Add new letter to the letter list.
      let letter = {
        'item': req.body.item,
        // 'priority': req.body.priority,
        // 'checked': ""
      }
      // let views = {
      //   'view': req.body.views
      // }
      letterList.push(letter);
      // viewsList.push(views);
      console.log(letterList);
// Render index page with updated To Do list.
      res.render('index', {letterList});
    }
  });
// Local web server to run the app.
app.listen(3000, function(){
  console.log('Started express application!')
});
