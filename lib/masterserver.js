var util = require('util'),
    events = require('events'),
    net = require('net'),
    dgram = require('dgram');

var MasterServer = function (options) {
  var self = this;

  this.options = {};
  this.channels = {};

  var key;
  for (key in options) {
    this.options[key] = options[key];
  }

  this.sock = dgram.createSocket("udp4", function (msg, socket) {
    var line = msg.toString();
    var parts = line.split(';');
    var data = {};
    parts.forEach(function (part) {
      var kv = part.split('=');
      data[kv[0]] = kv[1];
    });

    self._processData(data, socket);
  });
};

util.inherits(MasterServer, events.EventEmitter);

function dataToString (data) {
  //operation=serveraddress;server=127.0.0.1:1234:2345;server2=127.0.0.2:3456:4567

  if (typeof data == 'object') {
    var kvps = [];
    var key;
    for (key in data) {
      var value = data[key] || "";
      kvps.push(key.replace(/;/g, '').replace(/=/g, '') + "=" + value.replace(/;/g, '').replace(/=/g, ''));
    }
    return kvps.join(';');
  } else if (Array.isArray(data)) {
    var lines = [];
    data.forEach(function (line) {
      lines.push(dataToString(line));
    });
    return lines.join('\n');
  }

  return data;
}

MasterServer.prototype._processData = function (data, socket) {
  var self = this;
  var operation = data.operation;
  var middlewares = this.channels[operation] || [];

  var req = {
    port: socket.port,
    address: socket.address,
    query: data
  };

  var res = {
    socket: socket,
    send: function (data) {

      if (typeof data != 'string') {
        data = dataToString(data);
      }

      var message = new Buffer(data);
      self.sock.send(message, 0, message.length, socket.port, socket.address);
    }
  };

  (function next(i) {
    var middleware = middlewares[i];
    if (middleware == null) {
      return;
    }

    middleware(req, res, function (err) {
      if (err) {
        // TODO Process error
        return;
      }

      next(++i);
    })
  })(0);
};

MasterServer.prototype.register = function () {
  var key, middlewares;
  var args = Array.prototype.slice.call(arguments);
  key = args.shift();
  middlewares = args;

  if (typeof key !== 'string') {
    throw new Error('operation should be a string instead of ' + typeof key);
  }

  if (middlewares.length === 0) {
    throw new Error('You should specify middleware(s) for the channel');
  }

  if (this.channels[key] == undefined) {
    this.channels[key] = [];
  }

  this.channels[key] = this.channels[key].concat(middlewares);
  return;
};

MasterServer.prototype.listen = function (port) {
  this.options.port = port || this.options.port;
  this.sock.bind(this.options.port);
};


exports.createMasterServer = function (options) {
  return new MasterServer(options);
};