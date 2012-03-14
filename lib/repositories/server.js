var redis = require('redis');
r = redis.createClient();

var next = 0;
function generateServerId() {
  return Number("" + process.pid + (new Date()).getTime() + (++ next));
}

exports.getServer = function (id, cb) {
  var callback = function (err, data) {
    if (cb) {
      cb(err, data);
      cb = null;
    }
  };
  r.hgetall('server:' + id, callback);
};

exports.getServerByHostAndPort = function (host, port, cb) {
  var callback = function (err, data) {
    if (cb) {
      cb(err, data);
      cb = null;
    }
  };
  r.get('server_host:' + host + ":" + port, function (err, id) {
    if (err) {
      callback(err);
      return;
    }

    if (id == null) {
      callback();
      return;
    }

    exports.getServer(callback);
  });
};

exports.getServers = function (cb) {
  var callback = function (err, data) {
    if (cb) {
      cb(err, data);
      cb = null;
    }
  };
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
      callback(err, results);
    })

  });
};

exports.addServer = function (server, cb) {
  var callback = function (err, data) {
    if (cb) {
      cb(err, data);
      cb = null;
    }
  };
  var id = generateServerId();
  r.rpush('server_ids', id, function (err) {
    if (err) {
      callback(err);
      return;
    }

    server.id = id;
    r.set('server_host:' + server.host + ":" + server.port, id, function (err) {
      if (err) {
        callback(err);
        return;
      }
      r.hmset('server:' + id, server, function (err) {
        if (err) {
          callback(err);
          return;
        }

        callback(null, id);
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

  r.del('server_host:' + server.host + ":" + server.port, function (err) {
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

        callback();
      });
    });
  });
};

exports.updateServer = function (server, cb) {
  var callback = function (err, data) {
    if (cb) {
      cb(err, data);
      cb = null;
    }
  };
  r.hmset('server:' + server.id, server, callback);
};