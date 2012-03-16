var serverprovider = require('../../repositories/server');
exports = module.exports = function (respond) {
  return function (req, res, next) {
    serverprovider.getServers(function (err, servers) {
      if (err) {
        next(err);
        return;
      }

      servers = servers.map(function (server) {
        //[{"name":"AW Server 1","currentclients":0,"maxclients":16,"id":"95","awversion":"1.16.0.16"}]

        return {
          name: server.name,
          currentclients: Number(server.currentclients),
          maxclients: Number(server.maxclients),
          id: Number(server.id),
          awversion: server.awVersion
        };
      });

      if (respond) {
        servers.unshift("operation=serverlist;servercount=" + servers.length);
        res.send(servers);
      } else {
        req.servers = servers;
        next();
      }

    })
  };
};