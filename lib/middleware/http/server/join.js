var utils = require('../../../utils');
var serverprovider = require('../../../repositories/server');

exports = module.exports = function (respond) {
  return function (req, res, next) {
    var id = req.params.id || req.query.id;

    if (id == null) {
      return next(new Error("No id was defined"));
    }

    serverprovider.getServer(id, function (err, server) {
      if (err) {
        next(err);
        return;
      }

      if (server == null || server.id == undefined) {
        res.send({
          fail: 'Server full or not existing'
        });

        return;
      }

      res.send({
        server: server.address + ":" + server.port + ":" + server.tcpPort,
        server2: server.localEndPoint
      });

    });
  };
};