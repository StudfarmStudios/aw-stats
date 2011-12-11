var stats = require('../../../stats');


exports = module.exports = function () {
  return function (data, client, next) {
    var pilot = data._pilot;
    if (pilot) {
      client.send({PlayerDetails: pilot.token, Rating: pilot.rating});
      client.round.addPilot(pilot);
    }
    next();
  };
};