// STATS SERVER
var statsMiddlewares = require('./lib/middleware/stats');
var server = require('./lib/server').createServer(3000);

// ALLOWED IPS
server.allow('127.0.0.1');

// LOG EVERY REQUEST
server.register({}, statsMiddlewares.log());

// START LISTENING
server.listen(function (err) {
  if (err) {
    console.log(err.message);
  } else {
    console.log("Server started");
  }
});