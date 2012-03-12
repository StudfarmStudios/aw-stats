var util = require('util'),
    events = require('events'),
    net = require('net'),
    querify = require('querify');

var Server = function (options) {
  var self = this;

  if (options === null) {
    throw new Error('Options not specified');
  }

  if (options.port === undefined) {
    throw new Error('TCP server port not specified');
  }

  this.port = options.port;

  this.allowedIps = [];
  this.channels = [];

  this.crlf = options.crlf || "\r\n";
  this.server = net.createServer(function (socket) {
    var connected = true;
    if (self.allowedIps.indexOf(socket.remoteAddress) === -1) {
      socket.write('NOT ALLOWED'+options.crlf);
      socket.end();
      return;
    }

    socket.on('close', function () {
      connected = false;
    });

    var client = {ip: socket.remoteAddress, server: self};
    client.send = function (data) {
      if (connected) {
        socket.write(JSON.stringify(data) + self.crlf);
      } else {
        console.log("COULD not deliver: " + JSON.stringify(data));
      }
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
        data.server = self;
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

Server.prototype.getChannels = function(data) {
  var channels = [];
  for (var i = 0; i < this.channels.length; i++) {
    var channel = this.channels[i];
    var check = channel.check;
    if (check(data)) {
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

  var check = querify.compile(key);

  this.channels.push({key:key, check: check, middlewares: middlewares});
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

Server.prototype.allow = function (ip) {
  this.allowedIps.push(ip);
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

  this.server.listen(this.port, function (err) {
    if (err) {
      return callback(err);
    }
    ready();
  });

};

exports.createServer = function (port) {
  if (typeof port === 'number') {
    return new Server({port:port});
  } else if (typeof port === 'object') {
    return new Server(port);
  }
};