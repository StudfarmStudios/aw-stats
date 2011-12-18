var stats = require('../../../stats');


exports = module.exports = function () {
  return function (data, client, next) {
    var pilot = data._pilot;
    if (pilot) {
      ///client.send({PlayerDetails: pilot.token, Rating: pilot.rating}); DISABLING FOR NOW
      pilot.left = null;
      client.round.addPilot(pilot);
    } else {
      process.send({ cmd: 'irc', msg: "Anonymous pilot joined the server" });
    }
    next();
  };
};