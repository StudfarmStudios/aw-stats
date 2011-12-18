var irc = require('irc');
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

exports.say = function (msg) {
  if (connected) {
    client.say(settings.irc.channel, msg);
  } else {
    messageBuffer.push(msg);
  }
};