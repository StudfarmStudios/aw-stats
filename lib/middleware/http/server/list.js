var utils = require('../../../utils');

exports = module.exports = function (respond) {
  return function (req, res, next) {
    utils.getServers(function (err, servers) {
      res.send(servers);
    });
  };
};