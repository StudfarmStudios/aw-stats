var net = require('net');
var twitter = require('./twitter');
var irc = require('./irc');

var crlf = "\r\n";



function processServerRequest (data, socket) {
  var channel = data[0];
  var message = data[1];

  switch (channel) {
    case "irc":
      irc.say(message);
    break;
    case "twitter":
      twitter.tweet(message);
    break;
  }
  socket.write('OK ' + channel + crlf);
}

var server = net.createServer(function(socket) { //'connection' listener
   var buffer = "";
    function processBuffer() {
      var index = -1;
      while ((index = buffer.indexOf(crlf)) > -1) {
        var data = buffer.substring(0, index);
        buffer = buffer.substring(index + crlf.length);
        data = data.split('|');
        processServerRequest(data, socket);
      }
    }

    socket.on('data', function (data) {
      buffer += data.toString();
      processBuffer();
    });
});

server.listen('announcement.sock');
