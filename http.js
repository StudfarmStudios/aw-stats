var express = require('express');
var middlewares = require('./lib/middleware/http');

var app = express.createServer();

// TODO SOME KIND OF TOKEN FOR ALL THE ROUTES
app.get('/pilot/create', middlewares.pilot.create(true));
app.get('/pilot/list', middlewares.pilot.list(true));
app.get('/pilot/:id', middlewares.pilot.loader(true));


app.get('/login', middlewares.pilot.login(true));
app.listen(3001, function (err) {
  if (err) {
    return console.log(err.message);
  }
  console.log("HTTP Server started");
});