// STATS SERVER
var statsMiddlewares = require('./lib/middleware/stats');
var server = require('./lib/server').createServer(3000);

// ALLOWED IPS
server.allow('127.0.0.1');
server.allow('62.75.224.66');
server.allow('82.181.67.118');

// LOG EVERY REQUEST
server.register({}, statsMiddlewares.log());

server.register(
    {Arena: {$exists:true}},
    statsMiddlewares.arena()
);

server.register(
    {Killer: {$exists:true}},
    statsMiddlewares.parallel([
      statsMiddlewares.getPilot('Killer', '_killer'),
      statsMiddlewares.getPilot('Victim', '_victim')
    ]),
    statsMiddlewares.kill()
);

server.register(
    {Suicide: {$exists:true}},
    statsMiddlewares.parallel([
      statsMiddlewares.getPilot('Suicide', '_victim')
    ]),
    statsMiddlewares.suicide()
);

server.register(
    {$has : ['Ship', 'Weapon2', 'Device', 'Player']},
    statsMiddlewares.getPilot('Player', '_pilot'),
    statsMiddlewares.shipInfo()
);

// START LISTENING
server.listen(function (err) {
  if (err) {
    console.log(err.message);
  } else {
    console.log("Server started");
  }
});