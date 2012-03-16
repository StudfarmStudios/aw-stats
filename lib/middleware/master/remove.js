var serverprovider = require('../../repositories/server');
exports = module.exports = function () {
  return function (req, res, next) {
    serverprovider.getServerByHostAndPort(req.address, req.port, function (err, server) {
      if (err) {
        next(err);
        return;
      }

      if (server) {
        serverprovider.removeServer(server);
      }
    });
  };
};