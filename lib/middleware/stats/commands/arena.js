var Round = require('../../../model/round');
var Pilot = require('../../../model/pilot');
var pilotRepository = require('../../../repositories/pilot');

exports = module.exports = function () {
  return function (data, client, next) {
    if (client.round == undefined) {
      var arena;
      if (typeof data.Arena == "string") {
        arena = {name: data.Arena};
      } else {
        var parts = data.Arena.Size.replace(" ", "").split(",");
        var size = {width: Number(parts[0]), height: Number(parts[1])};
        arena = {name: data.Arena.Name, size: size};
      }
      client.round = new Round(arena, client);
      if (data.Players) {
        data.Players.forEach(function (pilot) {
          var token = pilot.LoginToken || pilot;
          if (pilot.Connected != undefined && pilot.Connected == false) {
            return;
          }
          if (token == null || typeof token != 'string' || token == "") {
            return;
          }
          pilotRepository.getPilotByToken(token, function (err, pilot) {
            var p = new Pilot(pilot, token, client);
            p.left = null;
            console.log("Had to get details for user " + p.username + " from the database");
            client.round.addPilot(p);
            client.send({PlayerDetails: p.token, Rating: p.rating});
          });
        });
      }
    } else {
      var arena;
      if (typeof data.Arena == "string") {
        arena = {name: data.Arena};
      } else {
        var parts = data.Arena.Size.replace(" ", "").split(",");
        var size = {width: parts[0], height: parts[1]};
        arena = {name: data.Arena.Name, size: size};
      }
      client.round.newRound(arena);
    }
    next();
  }
};
