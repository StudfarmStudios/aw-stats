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

  this.channels = {};

  this.httpServer = http.createServer(function (req, res) {

  });

  this.httpServer.on('error', function (err) {
    self.emit('error', err);
  });

  this.delimiter = options.delimiter || '|';
  this.crlf = options.crlf || "\r\n";

  this.server = net.createServer(function (socket) {
    var buffer = "";
    socket.on('data', function (data) {
      buffer += data.toString();
      if (buffer.indexOf(self.crlf) !== -1) {
        var parts = buffer.split(self.crlf);
        var data = parts.shift();
        buffer = parts.join(self.crlf);
        data = data.split(self.delimiter);
        self._processServerRequest(data, socket);
      }
    });
  });

  this.server.on('error', function (err) {
    self.emit('error', err);
  });

};

util.inherits(Server, events.EventEmitter);

Server.prototype._processServerRequest = function (data, socket) {
  var self = this;

  var type = data.shift();
  var id = 0;
  var channel = this.channels[type];
  
  if (channel === undefined) {
    if (!isNaN(data[data.length - 1])) {
      id = data.pop();
    }
    socket.write(id + self.delimiter + "ERR" + self.delimiter + "channel "+type+" doesn't exist" + this.crlf);
    return;
  }

  var keys = channel.keys;

  if(data.length != keys.length && data.length != (keys.length + 1)) {
    if (!isNaN(data[data.length - 1])) {
      id = data.pop();
    }
    socket.write(id + self.delimiter + "ERR"+self.delimiter + "invalid amount of values, should be " + keys.length + " + id (optional) " + this.crlf);
    return;
  }

  if (data.length === keys.length + 1) {
    id = data.pop();
  }

  var dataObject = {};

  for (var i = 0; i < keys.length; i++) {
    var key = keys[i];
    dataObject[key] = data[i];
  }

  var client = {reqId: id, ip: socket.remoteAddress, responded: false};
  client.send = function (data, isError) {
    if (client.responded) {
      throw new Error('Cant respond more than once');
    }
    if (typeof data === 'object' && data.join) {
      data = data.join(self.delimiter);
    }
    client.responded = true;
    socket.write(id
        + self.delimiter
        + (isError ? 'ERR' : 'OK')
        + (data ? self.delimiter +  data.toString():'')
        + self.crlf);
  };

  this._processData(channel, dataObject, client);

};

Server.prototype._processData = function (channel, data, client) {
  var middlewares = channel.middlewares;

  (function next(i) {
    var middleware = middlewares[i];
    if (!middleware) {
      if (!client.responded) {
        client.send();
      }
      return;
    }

    middleware(data, client, function (err) {
      if (err) {
        client.send(err.message, true);
        return;
      }

      next(++i);
    });
  })(0);

};

Server.prototype.register = function () {
  var type, keys, middlewares;
  var args = Array.prototype.slice.call(arguments);

  type = args.shift();
  keys = args.shift();
  middlewares = args;

  if (typeof type !== 'string') {
    throw new Error('Type should be a string instead of '+ typeof type);
  }

  if (typeof keys !== 'object') {
    throw new Error('Keys should be a array/object instead of '+ typeof keys);
  }

  if (middlewares.length === 0) {
    throw new Error('You should specify middleware(s) for the channel');
  }

  this.channels[type] = {keys: keys, middlewares: middlewares};

};

Server.prototype.unregister = function (type) {
  this.channels[type] = null;
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