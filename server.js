var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');

mongoose.Promise = global.Promise;

mongoose.connect('mongodb://localhost/beers');

var Beer = require("./models/BeerModel");
var Review= require('./models/ReviewModel');
var User= require('./models/UserModel');

var app = express();

app.use(bodyParser.json());   // This is the type of body we're interested in
app.use(bodyParser.urlencoded({extended: false}));


app.use(express.static('public'));
app.use(express.static('node_modules'));

//------------------------
// For authentication:
var passport = require('passport');
var expressSession = require('express-session');

app.use(expressSession({ secret: 'mySecretKey' }));

app.use(passport.initialize());
app.use(passport.session());
//------------------------

// app.use('/userPage', facebookAuthenticate(req, res, next));


// app.get('/userPage', fucntion(req, res){
//   res.send('userPage.html')
// })

app.get('/', function (req, res) {
  res.send("You are inside the fullstack project")
});

app.get('/beers', function (req, res) {

  Beer.find(function (error, beers) {
    res.send(beers);
  });
});

app.post('/beers', function (req, res, next) {
  console.log(req.body);

  var beer = new Beer(req.body);
  
  beer.save(function(err, beer) {
    if (err) { return next(err); }
    res.json(beer);
  });
});



app.delete('/beers/:id', function (req, res) {

  
  res.send('DELETE request to homepage');


  Beer.findByIdAndRemove(req.params.id, function(err) {
    if (err) throw err;

    // we have deleted the person
    console.log('Person deleted!');
  });


});


app.post('/beers/:id/reviews/', function(req, res, next) {
// req === {
//   date: '1/12/16', 
//   body: {name: "Daniel", text: "gross"},
//   params: {id: 123}
// }

// req.params.id === 123
// req.body === {name: "Daniel", text: "gross"}

// db.beers.findById() cousins with Beer.findById 
// Beer is the name of the schema, same way we search through a collection
  Beer.findById(req.params.id, function(err, foundBeer) {
    //foundBeer is the success funct of the beer we found in the database
    // we create a function within the function because once we
    // find the beer, we want to create and push a review object
    if (err) { return next(err); }

    var review = new Review(req.body);

    foundBeer.reviews.push(review);
      
    foundBeer.save(function (err, review) {
      if (err) { return next(err); }

      res.json(review);
    });  
  });
});

passport.serializeUser(function (user, done) {
  done(null, user);
});

passport.deserializeUser(function (user, done) {
  done(null, user);
});

var LocalStrategy = require('passport-local').Strategy;

passport.use('register', new LocalStrategy(function (username, password, done) {
  var user = {
    username: username,
    password: password
  }

  console.log(user);

  done(null, user);
}));

app.post('/register', passport.authenticate('register'), function (req, res) {
  res.json(req.user);
});

// send the current user back!
app.get('/currentUser', function (req, res) {
  res.send(req.user);
});

app.listen(8000);

