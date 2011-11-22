var util = require('util'),
    events = require('events'),
    http = require('http'),
    net = require('net');

var Server = function (options) {
  var self = this;

  if (options === null) {
    throw new Error('Options not specified');
  }

  if (options.port === undefined) {
    throw new Error('TCP server port not specified');
  }

  if (options.httpPort === undefined) {
    throw new Error('HTTP server port not specified');
  }

  this.port = options.port;
  this.httpPort = options.httpPort;

  this.channels = [];

  this.httpServer = http.createServer(function (req, res) {

  });

  this.httpServer.on('error', function (err) {
    self.emit('error', err);
  });

  this.crlf = options.crlf || "\r\n";
  this.server = net.createServer(function (socket) {

    var client = {ip: socket.remoteAddress, server: self};
    client.send = function (data) {
      socket.write(JSON.stringify(data) + self.crlf);
    };

    var buffer = "";

    function processBuffer() {
      var index = -1;
      while ((index = buffer.indexOf(self.crlf)) > -1) {
        var data = buffer.substring(0, index);
        buffer = buffer.substring(index + self.crlf.length);
        try {
          data = JSON.parse(data);
        } catch(e) {
          data = {};
        }
        self._processServerRequest(data, client);
      }
    }

    socket.on('data', function (data) {
      buffer += data.toString();
      processBuffer();
    });
  });

  this.server.on('error', function (err) {
    self.emit('error', err);
  });

};

util.inherits(Server, events.EventEmitter);

Server.prototype._checkConditionalOperators = function (key, value) {
  var p;

  for (p in key) {
    switch (p) {
      case '$gt':
        if (key[p] < value) {
          return true;
        }
        break;
      case '$gte':
        if (key[p] <= value) {
          return true;
        }
        break;
      case '$lt':
        if (key[p] > value) {
          return true;
        }
        break;
      case '$lte':
        if (key[p] >= value) {
          return true;
        }
        break;
      case '$in':
        if (key[p].indexOf(value) > -1) {
          return true;
        }
        break;
      case '$exists':
        if (value != null && key[p]) {
          return true;
        }
        break;
    }
  }
  return false;
};

Server.prototype._checkKeyAgainstData = function (key, data) {
  var p;

  for (p in key) {
    if (key[p]) {
      if (typeof(data[p]) == 'undefined') {
        return false;
      }
      switch (typeof(key[p])) {
        case 'object':
          if (typeof data[p] === 'object') {
            if (!this._checkKeyAgainstData(key[p], data[p])) {
              return false;
            }
          } else {
            if (!this._checkConditionalOperators(key[p], data[p])) {
              return false;
            }
          }
          break;
        case 'function':
          if (typeof(data[p]) == 'undefined' ||
              (p != 'equals' && key[p].toString() != data[p].toString()))
            return false;
          break;
        default:
          if (key[p] != data[p]) {
            return false;
          }
      }
    } else {
      if (data[p])
        return false;
    }
  }
  return true;
};

Server.prototype.getChannels = function(data) {
  var channels = [];
  for (var i = 0; i < this.channels.length; i++) {
    var channel = this.channels[i];
    var key = channel.key;
    if (this._checkKeyAgainstData(key, data)) {
      channels.push(channel);
    }
  }
  return channels;
};

Server.prototype._processServerRequest = function (data, client) {
  var self = this;
  var channels = this.getChannels(data);
  if (channels.length === 0) {
    return;
  }
  for (var i = 0; i < channels.length; i++) {
    var channel = channels[i];
    this._processData(channel, data, client);
  }
};

Server.prototype._processData = function (channel, data, client) {
  var middlewares = channel.middlewares;
  (function next(i) {
    var middleware = middlewares[i];
    if (!middleware) {
      return;
    }
    middleware(data, client, function (err) {
      if (err) {
        client.send({error: err.message});
        return;
      }
      next(++i);
    });
  })(0);
};

Server.prototype.register = function () {
  var key, middlewares;
  var args = Array.prototype.slice.call(arguments);
  key = args.shift();
  middlewares = args;

  if (typeof key !== 'object') {
    throw new Error('Key should be a object instead of ' + typeof key);
  }

  if (middlewares.length === 0) {
    throw new Error('You should specify middleware(s) for the channel');
  }

  this.channels.push({key:key, middlewares: middlewares});
  return this.channels.length - 1;
};

Server.prototype.unregister = function (keyOrIndx) {
  var self = this;
  switch (typeof keyOrIndx) {
    case 'object':
      var channels = this.getChannels(keyOrIndx);
      if (channels.length > 0) {
        for (var i = 0; i < channels.length; i++) {
          var channel = channels[i];
          self.channels.splice(self.channels.indexOf(channel), 1);
        }
      }
      break;
    case 'number':
      self.channels.splice(keyOrIndx, 1);
      break;
  }
};

Server.prototype.listen = function (cb) {
  var self = this;

  function callback(err) {
    if (cb) {
      cb(err);
      cb = null;
    }
  }

  function ready() {
    callback();
    self.emit('ready');
  }

  var httpReady = false;
  var serverReady = false;

  this.server.listen(this.port, function (err) {
    if (err) {
      return callback(err);
    }

    serverReady = true;

    if (httpReady) {
      ready();
    }
  });

  this.httpServer.listen(this.httpPort, function (err) {
    if (err) {
      return callback(err);
    }

    httpReady = true;

    if (serverReady) {
      ready();
    }
  });

};

exports.createServer = function (options) {
  return new Server(options);
};