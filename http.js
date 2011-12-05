var express = require('express');
var middlewares = require('./lib/middleware/http');
var fs = require('fs');

var options = {
  key: fs.readFileSync('server.key'),
  cert: fs.readFileSync('server.crt')
};

function defineRoutesAndMiddleware(app) {
// TODO SOME KIND OF TOKEN FOR ALL THE ROUTES
  app.get('/pilot/create', middlewares.pilot.create(true));
  app.get('/pilot/list', middlewares.pilot.list(true));
  app.get('/pilot/search', middlewares.pilot.search(true));
  app.get('/pilot/id/:id', middlewares.pilot.loader(true));
  app.get('/pilot/:username', middlewares.pilot.loader(true));
  app.get('/login', middlewares.pilot.login(true));

  app.error(function(err, req, res, next) {
    res.send({error: err.message});
  });
}

var app = express.createServer();
defineRoutesAndMiddleware(app);
app.listen(3001, function (err) {
  if (err) {
    return console.log(err.message);
  }
  console.log("HTTP Server started");
});


var secureApp = express.createServer(options);
defineRoutesAndMiddleware(secureApp);
secureApp.listen(3002, function (err) {
  if (err) {
    return console.log(err.message);
  }
  console.log("HTTPS Server started");
});