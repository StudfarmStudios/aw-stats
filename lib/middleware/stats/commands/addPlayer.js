var stats = require('../../../stats');

var masters = [
  "4eee13ecd3ee24647e000001",
  "4edf56c33eb21e930f00000e",
  "4eda1ef07b6eb5b25c000002"
];

exports = module.exports = function () {
  return function (data, client, next) {
    var pilot = data._pilot;
    if (pilot) {
      client.send({token: pilot.token, rating: pilot.rating});

      if (masters.indexOf(pilot._id.toString()) > -1) {
        client.send({to: pilot.token, announcement: "Hello Master!", all: false});
      }

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