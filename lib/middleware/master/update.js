var serverprovider = require('../../repositories/server');
exports = module.exports = function () {
  return function (req, res, next) {
    console.log("Received " + req.query.operation + " from " + req.address + ":" + req.port);
    serverprovider.getServerByHostAndPort(req.address, req.port, function (err, server) {
      if (err) {
        next(err);
        return;
      }

      if (server) {
        var currentclients = Number(req.query.currentclients);
        server.currentclients = currentclients;
        serverprovider.updateServer(server);
      }
    });
  };
};