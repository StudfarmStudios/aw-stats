var dgram = require('dgram');

var client = dgram.createSocket("udp4");
var message = new Buffer("operation=joinserver;serverid=123");
client.send(message, 0, message.length, 3003, "127.0.0.1");
client.on('message', function (msg) {
  var line = msg.toString();
  console.log(line);
  //'operation=serveraddress;server=127.0.0.1:1234:2345;server2=127.0.0.2:3456:4567'.
  var parts = line.split(';');
  var server = {};
  parts.forEach(function (part) {
    var kv = part.split('=');
    server[kv[0]] = kv[1];
  });
  client.close();
  console.log(server);
});