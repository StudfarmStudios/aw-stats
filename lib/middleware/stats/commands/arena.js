var Round = require('../../../model/round');
var Pilot = require('../../../model/pilot');
var pilotRepository = require('../../../repositories/pilot');

exports = module.exports = function () {
  return function (data, client, next) {
    if (client.round == undefined) {
      client.round = new Round(data.Arena, client);
      if (data.Players) {
        data.Players.forEach(function (token) {
          if (token == "") {
            return;
          }
          pilotRepository.getPilotByToken(token, function (err, pilot) {
            var p = new Pilot(pilot, token, client);
            p.left = null;
            console.log("Had to get details for user " + p.username + " from the database");
            client.round.addPilot(p);
          });
        });
      }
    } else {
      client.round.newRound(data.Arena);
    }
    next();
  }
};
