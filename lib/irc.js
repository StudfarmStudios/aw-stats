var irc = require('irc');
var utils = require('./utils');
var settings = require('./settings');
var natural = require('natural');
var classifier = new natural.BayesClassifier();

var unrecognizedCommands = [];

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

function processRecognized(req, res, next) {
  var i, command, from, to, path;

  if (req.ai) {
    return next();
  }

  from = req.from;
  to = res.to;
  path = req.path;

  unrecognizedCommands = unrecognizedCommands.filter(function (command) {
    console.log(command);
    if (command.from == from) {
      classifier.addDocument(command.path, path);
      console.log("Training", command.path, " > ", path);
      classifier.train();
      return false;
    } else {
      return true;
    }
  });
  next();
}

function processUnrecognized(req, res) {
  var from, to, path;
  from = req.from;
  to = res.to;
  path = req.path;
  var unrecognized = {path: path, from: from, to: to};
  unrecognizedCommands.push(unrecognized);
  setTimeout(function () {
    var indx = unrecognizedCommands.indexOf(unrecognized);
    if (indx > -1) {
      unrecognizedCommands.splice(indx, 1);
    }
  }, 1000 * 60 * 1);

  try {
    var command = classifier.classify(path);
    res.send("Hmm... Did you mean " + command + "? Type '!aw help' if not");
    processMessage(from, to, command, true);
  } catch (e) {
    res.send("Unrecognized command. Type '!aw help' for help");
  }

}

function processMessage(from, to, path, ai) {
  var i, captures, keys, data = {}, res = {to: to}, req = {from: from, query: {}, path: path, ai: ai};
  var send = function (data) {
    if (typeof data !== 'string') {
      data = JSON.stringify(data);
    }
    console.log("IRC", to, data);
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
  processUnrecognized(req, res);
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
  res.send('!aw nextgame');
});

addCommand('pilot',
    processRecognized,
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
    processRecognized,
    httpMiddlewares.pilot.loader(false),
    function (req, res, next) {
      var pilot = req.pilot;
      res.send(pilot.username + ", Score: " + (pilot.score || 0) + ", Rating: " + Math.round(pilot.rating || 1500));
    });

addCommand('rankings',
    processRecognized,
    function (req, res, next) {

    });

addCommand('nextgame',
    processRecognized,
    function (req, res, next) {
      utils.getNextGame(function(err, nextGameDate) {
        if (err) {
          res.send(err.message);
          return;
        }
        var diff = nextGameDate.getTime() - (new Date()).getTime();
        diff = diff / (1000 * 60 * 60);
        res.send("Next game starts in " + utils.hoursToTime(diff));
      });
    });