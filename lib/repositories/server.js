var r = require('../redis');
var waitandplay = require('./waitandplay');
var redisevents = require('../rediseventemitter');
var emitter = new redisevents.EventEmitter("server_info" + (process.env.NODE_ENV || ""));

exports.getServer = function (id, cb) {
  var callback = function (err, data) {
    if (cb) {
      cb(err, data);
      cb = null;
    }
  };
  r.hgetall('server:' + id, function (err, server) {
    if (err) {
      callback(err);
      return;
    }

    waitandplay.getWaitAndPlays(function (err, waitAndPlays) {
      if (err) {
        callback(err);
        return;
      }

      var waitsByServer = {};
      waitAndPlays.forEach(function (item) {
        if (waitsByServer[item.server] == undefined) {
          waitsByServer[item.server] = 0;
        }
        waitsByServer[item.server]++;


      });

      server.waiting = waitsByServer[server.id] || 0;
      callback(null, server);
    });

  });
};

exports.getServerByHostAndPort = function (address, port, cb) {
  var callback = function (err, data) {
    if (cb) {
      cb(err, data);
      cb = null;
    }
  };
  r.get('server_host:' + address + ":" + port, function (err, id) {
    if (err) {
      callback(err);
      return;
    }

    if (id == null) {
      callback();
      return;
    }

    exports.getServer(id, callback);
  });
};

exports.getServers = function (cb) {
  var callback = function (err, data) {
    if (cb) {
      cb(err, data);
      cb = null;
    }
  };
  waitandplay.getWaitAndPlays(function (err, waitAndPlays) {
    if (err) {
      callback(err);
      return;
    }

    var waitsByServer = {};
    waitAndPlays.forEach(function (item) {
      if (waitsByServer[item.server] == undefined) {
        waitsByServer[item.server] = 0;
      }
      waitsByServer[item.server]++;


    });

    r.lrange('server_ids', 0, -1, function (err, ids) {
      if (err) {
        callback(err);
        return;
      }

      if (ids.length == 0) {
        callback(null, []);
        return;
      }

      var multi = r.multi();

      ids.forEach(function (id) {
        multi.hgetall('server:' + id);
      });

      multi.exec(function (err, results) {
        results = results.filter(function (server) {
          server.waiting = waitsByServer[server.id] || 0;
          var lastPingSent = new Date(Number(server.lastPingSent));
          var lastPongReceived = new Date(Number(server.lastPongReceived));
          var diff = lastPingSent.getTime() - lastPongReceived.getTime();
          if (diff > (60 * 1000)) {
            exports.removeServer(server);
            return false;
          } else {
            return true;
          }

        });

        callback(err, results);
      })

    });

  });

};

exports.addServer = function (server, cb) {
  var callback = function (err, data) {
    if (cb) {
      cb(err, data);
      cb = null;
    }
  };
  r.incr('server_ids_next', function (err, id) {
    if (err) {
      callback(err);
      return;
    }
    r.rpush('server_ids', id, function (err) {
      if (err) {
        callback(err);
        return;
      }

      server.id = id;
      r.set('server_host:' + server.address + ":" + server.port, id, function (err) {
        if (err) {
          callback(err);
          return;
        }
        r.hmset('server:' + id, server, function (err) {
          if (err) {
            callback(err);
            return;
          }

          emitter.trigger('server_add', {
            id: server.id,
            name: server.name,
            waiting: server.waiting || 0,
            currentclients: Number(server.currentclients),
            maxclients: Number(server.maxclients)
          });

          callback(null, id);
        });
      });
    });
  });
};

exports.removeServer = function (server, cb) {
  var callback = function (err, data) {
    if (cb) {
      cb(err, data);
      cb = null;
    }
  };

  r.del('server_host:' + server.address + ":" + server.port, function (err) {
    if (err) {
      callback(err);
      return;
    }
    r.del('server:' + server.id, function (err) {
      if (err) {
        callback(err);
        return;
      }
      r.lrem('server_ids', 0, + server.id, function (err) {
        if (err) {
          callback(err);
          return;
        }

        emitter.trigger('server_remove', {id: server.id, name: server.name});

        callback();
      });
    });
  });
};

exports.updateServer = function (server, dontEmit, cb) {
  var callback = function (err, data) {
    if (cb) {
      cb(err, data);
      cb = null;
    }
  };

  if (dontEmit != true) {
    emitter.trigger('server_update', {
    id: server.id,
    name: server.name,
    waiting: server.waiting || 0,
    currentclients: Number(server.currentclients),
    maxclients: Number(server.maxclients)
    });
  }
  
  delete server.waiting;
  r.hmset('server:' + server.id, server, callback);
};