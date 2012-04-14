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

    serverprovider.getServerByHostAndPort(req.address, req.port, function (err, serv) {
      if (err) {
        next(err);
        return;
      }

      if (serv) {
        req.server = serv;
        serv.maxclients = server.maxclients;
        serv.currentclients = 0;
        serv.name = server.name;
        serv.awVersion = server.awVersion;
        serv.lastPongReceived = (new Date()).getTime();
        serv.lastPingSent = (new Date()).getTime();
        serverprovider.updateServer(serv);
      } else {
        serverprovider.addServer(server);
      }
    });
  };
};