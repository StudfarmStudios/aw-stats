var http = require('http-get');
var dgram = require('dgram');

exports.isValidObjectId = function (id) {
  var pattern = /^[0-9a-fA-F]{24}$/;
  return pattern.test(id);
};

exports.isValidPassword = function (password) {
  var pattern = /^\w*(?=\w*\d)(?=\w*[a-z])(?=\w*[A-Z])\w*$/;
  return pattern.test(password);
};

exports.getValueFromObject = function (key, data) {
  var parts = key.split('.');
  var i, value = data;
  for (i = 0; i < parts.length && value != null; i++) {
    value = value[parts[i]];
  }
  return value;
};

exports.calculateNewRating = function (pilot, pilots) {
  function getExpectedResult(opponent) {
    return 1 / (1 + Math.pow(10, (opponent.currentRound.rating - pilot.currentRound.rating) / 400));
  }

  function getResult(opponent) {
    if (opponent.currentRound.score > pilot.currentRound.score) {
      return 0;
    } else if (opponent.currentRound.score === pilot.currentRound.score) {
      return 0.5;
    } else {
      return 1;
    }
  }

  var expected = 0;
  var actual = 0;
  for (var id in pilots) {
    var opponent = pilots[id];
    if (opponent == pilot) {
      continue;
    }

    expected += getExpectedResult(opponent);
    actual += getResult(opponent);
  }

  var rating = pilot.currentRound.rating;

  var k = 16;
  if (rating < 2100) {
    k = 32;
  } else if (rating > 2100 && rating < 2400) {
    k = 24;
  }

  var gain = k * (actual - expected);
  var newRating = rating + gain;

  return newRating;
};

exports.get = function (url, callback) {
  var options = {url: url};

  http.get(options,function(err, result) {
    callback(err, result.buffer);
  });
};

exports.getNextGame = function (callback) {
  exports.get('http://assaultwing.com/nextgame', function (err, data) {
    if (err) {
      return callback(err);
    }
    var nextGameDate = new Date(data.toString().replace("\n", ""));
    callback(null, nextGameDate);
  });
};

exports.hoursToTime = function (hours) {
  var minutes  = Math.floor((hours % 1) * 60);
  hours = Math.floor(hours);
  return hours + "h" + (minutes > 0 ? (" " + minutes + "min") : "");
};

exports.capitaliseFirstLetter = function (string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
};

exports.getServers = function (callback) {
  var client = dgram.createSocket("udp4");
  var message = new Buffer("operation=listservers");
  client.send(message, 0, message.length, 16727, "assaultwing.com");
  client.on('message', function (msg) {
    var lines = msg.toString().split('\n');
    var header = lines.shift();
    var servers = [];
    lines.forEach(function (line) {
      //name=AW Server 1;currentclients=0;maxclients=16;id=388;awversion=1.14.0.1
      var parts = line.split(';');
      var server = {};
      parts.forEach(function (part) {
        var kv = part.split('=');
        server[kv[0]] = kv[1];
      });
      servers.push(server);
    });
    client.close();
    callback(null, servers);
  });
};