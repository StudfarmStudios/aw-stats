var express = require('express');
var middlewares = require('./lib/middleware/http');
var fs = require('fs');
var geoip = require('connect-geoip').geoip;
var repositories = require('./lib/repositories');

var redisevents = require('./lib/rediseventemitter');
var emitter = new redisevents.EventEmitter("server_info");


var options = {
  key: fs.readFileSync(__dirname + '/key.pem'),
  cert: fs.readFileSync(__dirname + '/cert.pem')
};

function defineRoutesAndMiddleware(app) {

  app.enable("jsonp callback");
  app.use(express.static(__dirname + '/site'));
  app.use(express.bodyParser());
// TODO SOME KIND OF TOKEN FOR ALL THE ROUTES

  app.get('/feed', geoip(), middlewares.feed.feed())

  app.get('/ranking/top1', middlewares.ranking.top1(true));

  app.get('/server/list', middlewares.server.list(true));
  app.get('/server/:id/join', middlewares.server.join(true));

  app.get('/pilot/create', middlewares.pilot.create(true));
  app.get('/pilot/list', middlewares.pilot.list(true));
  app.get('/pilot/search', middlewares.pilot.search(true));
  app.get('/pilot/id/:id/rankings', middlewares.pilot.rankings(true));
  app.get('/pilot/id/:id', middlewares.pilot.loader(true));
  app.get('/pilot/token/:token', middlewares.pilot.loader(true));
  app.get('/pilot/:username', middlewares.pilot.loader(true));

  app.get('/round/list', middlewares.round.list(true));

  app.get('/round/:id', middlewares.round.loader(true));

  app.get('/login', middlewares.pilot.login(true));
  app.post('/login', middlewares.pilot.login(true));

  app.get('/info', geoip(), function (req, res) {
    var response = {};
    response.geoip = req.geoip;
    response.nativeClickOnce = req.headers['http_x_clickoncesupport'] || req.headers['x-clickoncesupport'] || false;
    res.send(response);
  });

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

var sio = require('socket.io')
    , RedisStore = sio.RedisStore
    , io = sio.listen(app);

// Somehow pass this information to the workers
io.set('store', new RedisStore());


repositories.waitandplay.removeAll();
// Do the work here

var clients = [];

clients.emit = function () {
  var args = Array.prototype.slice.call(arguments);

  this.forEach(function (client) {
    client.emit.apply(client, args);
  });

};

io.sockets.on('connection', function (socket) {
  clients.push(socket);
  console.log("Socket connected");
  socket.on('auth', function (token) {
    console.log("Client auth with token " + token);
    var waitAndPlays = [];
    repositories.pilot.getPilotByToken(token, function (err, pilot) {
      if (err) {
        console.log(err);
        return;
      }
      io.sockets.emit('pilot_logged_in', {_id: pilot._id, username: pilot.username});
      console.log(pilot.username + " auth socket session");
      socket.on('pilot_joining', function (server) {
        io.sockets.emit('pilot_joining', {_id: pilot._id, username: pilot.username}, server);
      });
      socket.on('pilot_waiting', function (server) {
        io.sockets.emit('pilot_added_to_wait_and_play', {_id: pilot._id, username: pilot.username}, server);
        waitAndPlays.push(server.id);
        repositories.waitandplay.addWaitAndPlay(server.id, pilot._id);

        repositories.server.getServer(server.id, function (err, server) {
          if (err || server == null || server.id == undefined) {
            return;
          }
          clients.emit('server_update', {
            id: server.id,
            name: server.name,
            waiting: server.waiting || 0,
            currentclients: Number(server.currentclients),
            maxclients: Number(server.maxclients)
          });
        });

      });
      socket.on('pilot_not_waiting', function (server) {
        io.sockets.emit('pilot_removed_from_wait_and_play', {_id: pilot._id, username: pilot.username}, server);
        repositories.waitandplay.removeWaitAndPlay(server.id, pilot._id, function (err) {
          if (err) {
            console.log(err);
            return;
          }
          waitAndPlays = waitAndPlays.filter(function (serverId) {
            return !(serverId == server.id);
          });

          repositories.server.getServer(server.id, function (err, server) {
          if (err || server == null || server.id == undefined) {
            return;
          }
          clients.emit('server_update', {
            id: server.id,
            name: server.name,
            waiting: server.waiting || 0,
            currentclients: Number(server.currentclients),
            maxclients: Number(server.maxclients)
          });
        });

        });
      });

      socket.on('logout', function () {
        console.log(pilot.username + " logged out");
        io.sockets.emit('pilot_logged_out', {_id: pilot._id, username: pilot.username});
        socket.removeAllListeners('pilot_waiting');
        socket.removeAllListeners('pilot_not_waiting');
      });

      socket.on('disconnect', function () {
        clients.splice(clients.indexOf(socket), 1);
        io.sockets.emit('pilot_logged_out', {_id: pilot._id, username: pilot.username});
        waitAndPlays.forEach(function (serverId) {
          repositories.waitandplay.removeWaitAndPlay(serverId, pilot._id);
        });
      });
    });
  });
});

emitter.on('server_update', function (server) {
  clients.emit('server_update', server);
});

emitter.on('server_remove', function (server) {
  clients.emit('server_remove', server);
});

emitter.on('server_add', function (server) {
  clients.emit('server_add', server);
});


app.io = io;

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