var irc = require('irc');
var settings = require('./settings');

var connected = false;
var messageBuffer = [];

var commands = [];

var client = new irc.Client(settings.irc.host, settings.irc.nick, { channels : [settings.irc.channel] });

function normalize(path, keys, sensitive, strict) {
  if (path instanceof RegExp) return path;
  path = path
      .concat(strict ? '' : '/?')
      .replace(/\/\(/g, '(?:/')
      .replace(/(\/)?(\.)?:(\w+)(?:(\(.*?\)))?(\?)?/g, function(_, slash, format, key, capture, optional) {
        keys.push({ name: key, optional: !! optional });
        slash = slash || '';
        return ''
            + (optional ? '' : slash)
            + '(?:'
            + (optional ? slash : '')
            + (format || '') + (capture || (format && '([^/.]+?)' || '([^/]+?)')) + ')'
            + (optional || '');
      })
      .replace(/([\/.])/g, '\\$1')
      .replace(/\*/g, '(.*)');
  return new RegExp('^' + path + '$', sensitive ? '' : 'i');
}

function processMessage(from, to, path) {
  var i, captures, keys, data = {}, res = {to: to}, req = {from: from, query: {}};
  var send = function (data) {
    if (typeof data !== 'string') {
      data = JSON.stringify(data);
    }
    client.say(to, data);
  };
  res.end = send;
  res.send = send;
  res.write = send;

  for (i = 0; i < commands.length; i++) {
    var command = commands[i];
    if (captures = command.regex.exec(path)) {
      keys = command.keys;
      // params from capture groups
      for (var j = 1, jlen = captures.length; j < jlen; ++j) {
        var key = keys[j - 1]
            , val = 'string' == typeof captures[j]
            ? decodeURIComponent(captures[j])
            : captures[j];
        data[key.name] = val;
      }
      req.params = data;
      (function next(i) {
        var middleware = command.middlewares[i];
        if (middleware == null) {
          return;
        }
        middleware(req, res, function (err) {
          if (err) {
            return res.send(err.message);
          }
          next(++i);
        });
      })(0);
      return;
    }
  }
  res.send("Unrecognized command. Type '!aw help' for help");
}

exports.test = processMessage;

client.on('connect', function () {
  console.log("IRC connected to " + settings.irc.host);
});

client.on('join', function () {
  connected = true;
  messageBuffer.forEach(function (msg) {
    client.say(settings.irc.channel, msg);
  });
});

client.on('message', function (from, to, msg) {
  if (msg.indexOf('!aw') === 0) {
    var parts = msg.split(' ');
    var command = parts.shift();
    if (command != '!aw') {
      return;
    }
    var path = (parts.length > 0) ? parts.join(' ') : null;
    if (to == settings.irc.nick) {
      to = from;
    }
    processMessage(from, to, path);
  }
});

var say = exports.say = function (msg) {
  if (connected) {
    client.say(settings.irc.channel, msg);
  } else {
    messageBuffer.push(msg);
  }
};

var addCommand = exports.addCommand = function () {
  var args = Array.prototype.slice.call(arguments);
  var path = args.shift();
  var middlewares = args;
  var command = {path: path, middlewares: middlewares};
  var regex = normalize(path, command.keys = [], false, false);
  command.regex = regex;
  commands.push(command);
};

// IRC COMMANDS

var httpMiddlewares = require('./middleware/http');

// ["playTime", "score", "kills.total", "deaths.total", "wins.total", "suicides.total", "rating"]

addCommand('help', function (req, res, next) {
  res.send('!aw pilot [username]');
  res.send('!aw rankings');
});

addCommand('pilot',
    function (req, res, next) {
      req.params.username = req.from;
      next();
    },
    httpMiddlewares.pilot.loader(false),
    function (req, res, next) {
      var pilot = req.pilot;
      res.send(pilot.username + ", Score: " + (pilot.score || 0) + ", Rating: " + Math.round(pilot.rating || 1500));
    });

addCommand('pilot :username',
    httpMiddlewares.pilot.loader(false),
    function (req, res, next) {
      var pilot = req.pilot;
      res.send(pilot.username + ", Score: " + (pilot.score || 0) + ", Rating: " + Math.round(pilot.rating || 1500));
    });

addCommand('rankings', function (req, res, next) {

});
