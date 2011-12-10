var stats = require('../../../stats');
var utils = require('../../../utils');
var pilotRepository = require('../../../repositories/pilot');
var ObjectId = require('mongodb').BSONPure.ObjectID;

exports = module.exports = function () {
  return function (data, client, next) {
    processPreviousRound(client);
    client.arena = data.Arena;
    client.roundStarted = new Date();
    client.roundId = new ObjectId();
    if (client.pilots == undefined) {
      client.pilots = {};
    }

    if (client.pilots == undefined) {
      client.pilots = {};
    }

    if (client.tokens == undefined) {
      client.tokens = {};
    }

    if (data.Players) {
      for (var i = 0; i < data.Players.length; i++) {
        var token = data.Players[i];
        if (token == "") {
          continue;
        }
        var pilotId = (client.tokens && client.tokens[token]) ? client.tokens[token] : null;
        if (pilotId) {
          if (client.pilots && client.pilots[pilotId]) {
            client.pilots[pilotId].currentRound = {score:0, shots:{total:0, weapons:{}}, kills: {total:0, pilots:{}}, deaths: {total:0, pilots:{}}, suicides: {total:0}};
            client.send({PlayerDetails: token, Rating: client.pilots[pilotId].rating});
          } else {
            pilotRepository.getPilotById(pilotId, function (err, pilot) {
              if (err) {
                client.send({error: err.message, token: token});
                return;
              }

              client.tokens[token] = pilot._id;
              client.pilots[pilot._id] = {started: new Date(), token: token,  _id: pilot._id, username: pilot.username, rating: pilot.rating || 1500, currentRound: {score:0, shots:{total:0, weapons:{}}, kills: {total:0, pilots:{}}, deaths: {total:0, pilots:{}}, suicides: {total:0}}};
              client.send({PlayerDetails: token, Rating: client.pilots[pilotId].rating});
              
            });
          }
        } else {
          pilotRepository.getPilotByToken(token, function (err, pilot) {
            if (err) {
              client.send({error: err.message, token: token});
              return;
            }
            
            client.tokens[token] = pilot._id;
            client.pilots[pilot._id] = {started: new Date(), token: token,  _id: pilot._id, username: pilot.username, rating: pilot.rating || 1500, currentRound: {score:0, shots:{total:0, weapons:{}}, kills: {total:0, pilots:{}}, deaths: {total:0, pilots:{}}, suicides: {total:0}}};
            client.send({PlayerDetails: token, Rating: client.pilots[pilot._id].rating});
            
          });
        }
      }
    }
    next();
  }
};


function processPreviousRound(client) {
  if (client.arena) {
    if (client.pilots) {
      var results = [];
      for (var id in client.pilots) {
        var pilot = client.pilots[id];
        var oldRating = pilot.rating;
        var newRating = utils.calculateNewRating(pilot, client.pilots);
        if (newRating !== pilot.rating) {
          pilot.rating = newRating;
          stats.updatePilot(id, {$set: {rating: newRating}});
          client.send({NewRating: pilot.token, Rating: newRating});
        }
        results.push({_id: pilot._id, score: pilot.currentRound.score, username: pilot.username, oldRating: oldRating, newRating: newRating});
      }
      stats.saveRound({arena: client.arena, _id: client.roundId, started: client.roundStarted, ended: new Date(), results: results});
    }
  }
}