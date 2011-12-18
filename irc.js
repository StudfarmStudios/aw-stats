var irc = require('irc');
var pilotRepository = require('./lib/repositories/pilot');
var settings = require('./lib/settings');

var connected = false;
var messageBuffer = [];

var client = new irc.Client(settings.irc.host, settings.irc.nick, { channels : [settings.irc.channel] });

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
    if (parts[0] != '!aw') {
      return;
    }
    var username = parts[1] || from;
    pilotRepository.getPilotByUsername(username, function (err, pilot) {
      if (err) {
        exports.say(err.message);
        return;
      }
      exports.say(username + ", Score: " + (pilot.score || 0) +", Rating: " + Math.round(pilot.rating || 1500));
    });
  }
});

exports.say = function (msg) {
  if (connected) {
    client.say(settings.irc.channel, msg);
  } else {
    messageBuffer.push(msg);
  }
};