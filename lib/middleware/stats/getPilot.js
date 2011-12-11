var pilotRepository = require('../../repositories/pilot');
var events = require('events');
var eventEmitter = new events.EventEmitter();
var pilots = {};
var Pilot = require('../../model/pilot');

exports = module.exports = function (location, key) {
  key = key || '_pilot';
  var parts = location.split('.');
  return function (data, client, next) {
    var token = data;
    for(var i = 0; i < parts.length; i++) {
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
       data[key] = new Pilot (pilot, token, client);
       next();
     });
    } else {
      // loading data
      pilots[token] = true;
      pilotRepository.getPilotByToken(token, function (err, pilot) {
        pilots[token] = false;
        eventEmitter.emit(token, err, pilot);
        if (err) {
          return next(err);
        }
        console.log("Had to get details for use "+pilot.username+" from the database");
        data[key] = new Pilot (pilot, token, client);
        next();
      });
    }
  }
};