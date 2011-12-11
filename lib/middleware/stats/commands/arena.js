var Round = require('../../../model/round');
var Pilot = require('../../../model/pilot');
var pilotRepository = require('../../../repositories/pilot');

exports = module.exports = function () {
  return function (data, client, next) {
    if (client.round == undefined) {
      client.round = new Round(data.Arena, client);
      if (data.Players) {
        data.Players.forEach(function (token) {
          pilotRepository.getPilotByToken(token, function (err, pilot) {
            var p = new Pilot(pilot, token, client);
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
