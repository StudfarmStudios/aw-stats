var pilotRepository = require('../../repositories/pilot');
var events = require('events');
var eventEmitter = new events.EventEmitter();
var pilots = {};
var Pilot = require('../../model/pilot');

exports = module.exports = function (location, key, addToRound) {
  key = key || '_pilot';
  var parts = location.split('.');
  return function (data, client, next) {
    var token = data;
    for (var i = 0; i < parts.length; i++) {
      token = data[parts[i]];
    }

    if (token === "") {
      return next();
    }

    if (client.round) {
      var pilot = client.round.getPilotByToken(token);
      if (pilot) {
        data[key] = pilot;
        next();
        return;
      }
    }

    if (pilots[token] === true) {
      // data is already loading
      eventEmitter.on(token, function (err, pilot) {
        if (err) {
          return next(err);
        }
        data[key] = new Pilot(pilot, token, client);
        next();
      });
    } else {
      // loading data
      pilots[token] = true;
      pilotRepository.getPilotIdByToken(token, function (err, id) {
        if (err) {
          return next(err);
        }
        if (client.round) {
          var pilot = client.round.getPilotById(id);
          if (pilot) {
            console.log("Could not find " + pilot.username + " from round with token, but succeeded with id");
            pilot.token = token;
            pilots[token] = false;
            eventEmitter.emit(token, null, pilot);
            data[key] = pilot;
            next();
            return;
          }
        }
        pilotRepository.getPilotById(id, function (err, pilot) {
          pilots[token] = false;
          eventEmitter.emit(token, err, pilot);
          if (err) {
            return next(err);
          }
          console.log("Had to get details for user " + pilot.username + " from the database");
          var p = new Pilot(pilot, token, client);
          data[key] = p;
          if (addToRound && client.round) {
            console.log("Force adding " + pilot.username + " to the round. This could be a bug, so it could be good to check it out");
            client.round.addPilot(p);
          }
          next();
        });
      });
    }
  }
};