var middlewares = require('./lib/middleware/master');
var serverprovider = require('./lib/repositories/server');

var server = require('./lib/masterserver').createMasterServer({port: 3003});

server.register('addserver', middlewares.add());
server.register('joinserver', middlewares.join());
server.register('removeserver', middlewares.remove());
server.register('updateserver', middlewares.update());
server.register('listservers', middlewares.list(true));

setInterval(function () {
  serverprovider.getServers(function (err, gameServers) {
    if (err) {
      return;
    }

    gameServers.forEach(function (gameServer) {
      var message = new Buffer("operation=ping");
      server.sock.send(message, 0, message.length, gameServer.port, gameServer.address);
      gameServer.lastPingSent = (new Date()).getTime();
      serverprovider.updateServer(gameServer);
    });

  });
}, 5000);

server.listen();