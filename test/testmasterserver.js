var dgram = require('dgram');

var client = dgram.createSocket("udp4");

var serverprovider = require('../lib/repositories/server');


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
  console.log(server);
});

console.log("add")
var message2 = new Buffer("operation=addserver;name=testi;maxclients=255;localendpoint=2313123321:231321:123321;awversion=31321213;tcpport=1132");
client.send(message2, 0, message2.length, 16727, "127.0.0.1");

setTimeout(function () {
  console.log("list")
  var message = new Buffer("operation=listservers");
  client.send(message, 0, message.length, 16727, "127.0.0.1");
  serverprovider.getServers(function (err, servers) {
    var server = servers[0];
    console.log("join")
    var message = new Buffer("operation=joinserver;serverid=" + server.id);
    client.send(message, 0, message.length, 16727, "127.0.0.1");

    setTimeout(function () {
      //operation=updateserver;currentclients=<current client #>
      setTimeout(function () {
      console.log("Update");
      var message = new Buffer("operation=updateserver;currentclients=1");
      client.send(message, 0, message.length, 16727, "127.0.0.1");
      }, 10000);
      setInterval(function () {
         console.log("List");
        var message = new Buffer("operation=listservers");
        client.send(message, 0, message.length, 16727, "127.0.0.1");
/**
        setTimeout(function () {
           console.log("Remove");
          var message = new Buffer("operation=removeserver");
          client.send(message, 0, message.length, 16727, "127.0.0.1");

          setTimeout(function () {
           console.log("List");
           var message = new Buffer("operation=listservers");
          client.send(message, 0, message.length, 16727, "127.0.0.1");


        }, 1000);

        }, 1000);
 **/

      }, 1000);

    }, 1000);

  });

}, 1000);
