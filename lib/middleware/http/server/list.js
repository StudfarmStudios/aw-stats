var utils = require('../../../utils');

exports = module.exports = function (respond) {
  return function (req, res, next) {
    utils.getServers(function (err, servers) {
      if (respond) {
        res.send(servers);
      } else {
        req.servers = servers;
        next();
      }
    });
  };
};