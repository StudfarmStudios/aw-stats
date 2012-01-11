var express = require('express');
var middlewares = require('./lib/middleware/http');
var fs = require('fs');
var geoip = require('connect-geoip').geoip;

var options = {
  key: fs.readFileSync(__dirname + '/key.pem'),
  cert: fs.readFileSync(__dirname + '/cert.pem')
};

function defineRoutesAndMiddleware(app) {

  app.enable("jsonp callback");
  app.use(express.static(__dirname + '/site'));
// TODO SOME KIND OF TOKEN FOR ALL THE ROUTES

  app.get('/feed', geoip(), middlewares.feed.feed())

  app.get('/ranking/top1', middlewares.ranking.top1(true));

  app.get('/server/list', middlewares.server.list(true));

  app.get('/pilot/create', middlewares.pilot.create(true));
  app.get('/pilot/list', middlewares.pilot.list(true));
  app.get('/pilot/search', middlewares.pilot.search(true));
  app.get('/pilot/id/:id/rankings', middlewares.pilot.rankings(true));
  app.get('/pilot/id/:id', middlewares.pilot.loader(true));
  app.get('/pilot/:username', middlewares.pilot.loader(true));

  app.get('/round/list', middlewares.round.list(true));

  app.get('/round/:id', middlewares.round.loader(false), middlewares.round.kills(false), function (req, res, next) {
    var round = req.round;
    var kills = req.roundKills;
    var i;
    round.results.forEach(function (result) {
      for (i = 0; kills.length; i++) {
        if (kills[i]._id.toString() === result._id.toString()) {
          result.killsByPilot = kills[i].value;
          kills.splice(i,1);
          break;
        }
      }
    });
    res.send(round);
  });

  app.get('/login', middlewares.pilot.login(true));

  app.error(function(err, req, res, next) {
    console.log(err);
    var response = {error: err.message};
    if (err.data) {
      response.data = err.data;
    }
    res.send(response);
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