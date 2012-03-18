var utils = require('../../../utils');
var repositories = require('../../../repositories');

exports = module.exports = function (respond) {
  return function (req, res, next) {
    repositories.server.getServers(function (err, servers) {

      servers = servers.map(function (server) {
        return {
          id: server.id,
          name: server.name,
          waiting: server.waiting || 0,
          currentclients: Number(server.currentclients),
          maxclients: Number(server.maxclients)
        };
      });

      if (respond) {
        res.send(servers);
      } else {
        req.servers = servers;
        next();
      }
    });
  };
};