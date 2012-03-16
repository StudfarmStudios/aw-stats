var serverprovider = require('../../repositories/server');
exports = module.exports = function () {
  return function (req, res, next) {
    console.log("Received " + req.query.operation + " from " + req.address + ":" + req.port);


    var server = {};
    server.created = (new Date()).getTime();
    server.currentclients = 0;
    server.name = req.query.name;
    server.maxclients = Number(req.query.maxclients);
    server.localEndPoint = req.query.localendpoint;
    server.tcpPort = req.query.tcpport;
    server.awVersion = req.query.awversion;
    server.port = req.port;
    server.address = req.address;
    server.lastPongReceived = (new Date()).getTime();
    server.lastPingSent = (new Date()).getTime();

    req.server = server;

    serverprovider.getServerByHostAndPort(req.host, req.port, function (err, serv) {
      if (err) {
        next(err);
        return;
      }

      if (serv) {
        req.server = serv;
      } else {
        serverprovider.addServer(server);
      }
    });
  };
};