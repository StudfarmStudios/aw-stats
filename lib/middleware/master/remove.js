var serverprovider = require('../../repositories/server');
exports = module.exports = function () {
  return function (req, res, next) {
    serverprovider.getServerByHostAndPort(req.host, req.port, function (err, server) {
      if (err) {
        next(err);
        return;
      }

      if (server) {
        serverprovider.remove(server);
      }
    });
  };
};