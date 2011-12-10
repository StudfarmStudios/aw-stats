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
    statsMiddlewares.commands.arena()
);

server.register(
    {AddPlayer: {$exists:true}},
    statsMiddlewares.getPilot('AddPlayer', '_pilot', true),
    statsMiddlewares.commands.addPlayer()
);

server.register(
    {RemovePlayer: {$exists:true}},
    statsMiddlewares.getPilot('RemovePlayer', '_pilot'),
    statsMiddlewares.commands.removePlayer()
);

server.register(
    {Killer: {$exists:true}},
    statsMiddlewares.parallel([
      statsMiddlewares.getPilot('Killer', '_killer'),
      statsMiddlewares.getPilot('Victim', '_victim')
    ]),
    statsMiddlewares.commands.kill()
);

server.register(
    {Suicide: {$exists:true}},
    statsMiddlewares.parallel([
      statsMiddlewares.getPilot('Suicide', '_victim')
    ]),
    statsMiddlewares.commands.suicide()
);

server.register(
    {$has : ['Ship', 'Weapon2', 'Device', 'Player']},
    statsMiddlewares.getPilot('Player', '_pilot'),
    statsMiddlewares.commands.shipinfo()
);

server.register(
    {$has : ['Bonus', 'Player']},
    statsMiddlewares.getPilot('Player', '_pilot'),
    statsMiddlewares.commands.bonus()
);

// START LISTENING
server.listen(function (err) {
  if (err) {
    console.log(err.message);
  } else {
    console.log("Server started");
  }
});