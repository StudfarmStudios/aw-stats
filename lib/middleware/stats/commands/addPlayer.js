var stats = require('../../../stats');


exports = module.exports = function () {
  return function (data, client, next) {
    var pilot = data._pilot;
    if (pilot) {
      client.send({token: pilot.token, rating: pilot.rating});
      if (pilot.left) {
        process.send({ cmd: 'irc', msg: pilot.username + " rejoined the round"});
      }
      pilot.left = null;
      client.round.addPilot(pilot);
    } else {
      process.send({ cmd: 'irc', msg: "Anonymous pilot joined the server" });
    }
    next();
  };
};