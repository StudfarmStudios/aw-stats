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
    {Server: {$exists:true}},
    statsMiddlewares.commands.server()
);

server.register(
    {Arena: {$exists:true}},
    statsMiddlewares.commands.arena()
);

server.register(
    {ArenaFinished: {$exists:true}},
    statsMiddlewares.commands.arenafinished()
);

server.register(
    {AddPlayer: {$exists:true}},
    statsMiddlewares.getPilot('AddPlayer', '_pilot'),
    statsMiddlewares.commands.addPlayer()
);

server.register(
    {RemovePlayer: {$exists:true}},
    statsMiddlewares.getPilot('RemovePlayer', '_pilot'),
    statsMiddlewares.commands.removePlayer()
);

server.register(
    {Killer: {$exists:true}},
    statsMiddlewares.position(),
    statsMiddlewares.parallel([
      statsMiddlewares.getPilot('Killer', '_killer', true),
      statsMiddlewares.getPilot('Victim', '_victim', true)
    ]),
    statsMiddlewares.commands.kill()
);

server.register(
    {Suicide: {$exists:true}},
    statsMiddlewares.position(),
    statsMiddlewares.parallel([
      statsMiddlewares.getPilot('Suicide', '_victim', true)
    ]),
    statsMiddlewares.commands.suicide()
);

server.register(
    {$has : ['Ship', 'Weapon2', 'Device', 'Player']},
    statsMiddlewares.position(),
    statsMiddlewares.getPilot('Player', '_pilot', true),
    statsMiddlewares.commands.shipinfo()
);

server.register(
    {$has : ['Fired', 'Type', 'Role']},
    statsMiddlewares.position(),
    statsMiddlewares.getPilot('Fired', '_pilot', true),
    statsMiddlewares.commands.fired()
);

server.register(
    {$has : ['Hit', 'Target']},
    statsMiddlewares.position(),
    statsMiddlewares.getPilot('HitOwner', '_sender', true),
    statsMiddlewares.getPilot('TargetOwner', '_receiver', true),
    statsMiddlewares.commands.hit()
);

server.register(
    {$has : ['Bonus', 'Player']},
    statsMiddlewares.position(),
    statsMiddlewares.getPilot('Player', '_pilot', true),
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