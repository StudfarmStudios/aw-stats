var pilotRepository = require('../../repositories/pilot');
var events = require('events');
var eventEmitter = new events.EventEmitter();
var pilots = {};

function getPilotFromClient (client, token) {
  if (client.tokens && client.tokens[token]) {
      var pilot = client.pilots[client.tokens[token]];
      return pilot;
    }
}

exports = module.exports = function (location, key, needsAllData) {
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

    if (!needsAllData) {
      var pilot = getPilotFromClient(client, token);
      data[key] = pilot;
      next();
    }

    if (pilots[token] === true) {
     // data is already loading
     eventEmitter.on(token, function (err, pilot) {
       if (err) {
          return next(err);
       }
       data[key] = pilot;

       var cPilot = getPilotFromClient(client, token);
       if (cPilot) {
         for (var i in cPilot) {
           data[key][i] = cPilot[i];
         }
       }

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
        data[key] = pilot;

        var cPilot = getPilotFromClient(client, token);
        if (cPilot) {
          for (var i in cPilot) {
            data[key][i] = cPilot[i];
          }
        }

        next();
      });
    }
  }
};