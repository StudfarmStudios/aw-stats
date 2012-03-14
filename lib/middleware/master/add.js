var serverprovider = require('../../repositories/server');
exports = module.exports = function () {
  return function (req, res, next) {
    var server = {};
    server.created = new Date();
    server.currentclients = 0;
    server.maxclients = Number(req.query.maxclients);
    server.localEndPoint = req.query.localEndPoint;
    server.tcpPort = req.query.tcpport;
    server.awVersion = req.query.awVersion;
    server.port = req.port;
    server.address = server.address;

    req.server = server;

    serverprovider.getServerByHostAndPort(req.host, req.port, function (err, server) {
      if (err) {
        next(err);
        return;
      }

      if (server) {
        req.server = server;
      } else {
        serverprovider.addServer(server);
      }
    });
  };
};