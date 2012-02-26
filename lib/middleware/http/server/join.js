var utils = require('../../../utils');

exports = module.exports = function (respond) {
  return function (req, res, next) {
    var id = req.params.id || req.query.id;

    if (id == null) {
      return next(new Error("No id was defined"));
    }

    utils.getServerInfo(id, function (err, server) {
      if (respond) {
        res.send(server);
      } else {
        req.server = server;
        next();
      }
    });
  };
};