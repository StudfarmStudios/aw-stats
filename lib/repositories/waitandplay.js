var r = require('../redis');

exports.addWaitAndPlay = function (serverId, pilotId, cb) {
  var callback = function (err, data) {
    if (cb) {
      cb(err, data);
      cb = null;
    }
  };

  var multi = r.multi();
  multi.lrem('wait_and_play', 0, pilotId + ":" + serverId);
  multi.rpush('wait_and_play', pilotId + ":" + serverId);
  multi.exec(callback);
};

exports.removeWaitAndPlay = function (serverId, pilotId, cb) {
  var callback = function (err, data) {
    if (cb) {
      cb(err, data);
      cb = null;
    }
  };

  r.lrem('wait_and_play', 0, pilotId + ":" + serverId, callback)
};

exports.getWaitAndPlays = function (cb) {
  var callback = function (err, data) {
    if (cb) {
      cb(err, data);
      cb = null;
    }
  };

  r.lrange('wait_and_play', 0, -1, function (err, ids) {
    if (err) {
      callback(err);
      return;
    }

    ids = ids.map(function (item) {
      var parts = item.split(':');
      return {pilot: parts[0], server: parts[1]};
    });

    callback(null, ids);
  });
};

exports.removeAll = function (cb) {
  var callback = function (err, data) {
    if (cb) {
      cb(err, data);
      cb = null;
    }
  };

  r.del('wait_and_play', callback);
};