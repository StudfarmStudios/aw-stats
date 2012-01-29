var database = require('./database');
var utils = require('./utils');
var twitter = require('./twitter');

function updatePilot(id, data, callback) {
  if (!utils.isValidObjectId(id)) {
    return;
  }
  database.getCollection('pilot', function (err, collection) {
    if (err) {
      if (callback) callback(err);
      return;
    }
    collection.update({_id: collection.db.bson_serializer.ObjectID(id.toString())}, data);
  });
}

exports.updatePilot = updatePilot;

exports.kill = function (killer, victim, arena, roundId, pos, ship) {
  if (killer) {
    var update = {$inc: {}};
    update['$inc']["kills.total"] = 1;
    update['$inc']["score"] = 2;
    if (arena) {
      update['$inc']["kills.arena." + arena] = 1;
    }
    updatePilot(killer, update);
    equipmentStat(ship, update);
  }

  database.getCollection('kill', function (err, collection) {
    if (err) {
      return;
    }
    collection.insert({date: new Date(), killer: killer, victim: victim, arena: arena, round: roundId, pos: pos})
  });
};

exports.death = function (victim, killer, arena, roundId, pos, ship) {
  if (victim) {
    var update = {$inc: {}};
    update['$inc']["deaths.total"] = 1;
    update['$inc']["score"] = -1;
    if (arena) {
      update['$inc']["deaths.arena." + arena] = 1;
    }
    equipmentStat(ship, update);
    updatePilot(victim, update);
  }
};

exports.suicide = function (victim, arena, roundId, pos, ship) {
  if (victim) {
    var update = {$inc: {}};
    update['$inc']["suicides.total"] = 1;
    update['$inc']["score"] = -1;
    if (arena) {
      update['$inc']["suicides.arena." + arena] = 1;
    }

    updatePilot(victim, update);
    equipmentStat(ship, update);

    database.getCollection('kill', function (err, collection) {
      if (err) {
        return;
      }
      collection.insert({date: new Date(), killer: victim, victim: victim, arena: arena, round: roundId, pos: pos})
    });
  }
};

exports.bonus = function (pilot, bonus, arena, roundId, pos) {
  if (pilot) {
    var update = {$inc: {}};
    update['$inc']["bonus." + bonus + ".total"] = 1;
    if (arena) {
      update['$inc']["bonus." + bonus + ".arena." + arena] = 1;
    }
    updatePilot(pilot, update);
    database.getCollection('bonus', function (err, collection) {
      if (err) {
        return;
      }
      collection.insert({date: new Date(), bonus: bonus, pilot: pilot, arena: arena, round: roundId, pos: pos});
    });
  }
};

var equipmentStat = exports.equipmentStat = function (ship, data) {
  database.getCollection('equipment', function (err, collection) {
    if (err) {
      console.log(err);
      if (callback) callback(err);
      return;
    }
    collection.update({_id: ship}, data, {upsert: true});
  });
};

exports.saveRound = function (round) {
  if (round.results.length <= 1) {
    return;
  }
  
  round.results.sort(function (a, b) {
    return b.score - a.score;
  });

  var winningScore =  round.results[0] ? round.results[0].score : 0;

  var winners = [];
  for (var i = 0; i < round.results.length; i++) {
    if (round.results[i].score < winningScore) {
      break;
    }

    winners.push(round.results[i]);

    var update = {$inc: {}};
    update['$inc']["wins.total"] = 1;
    update['$inc']["wins.arena." + round.arena.name] = 1;

    if (round.results[i]._id)
      updatePilot(round.results[i]._id, update);
  }

  var message = "";
  if (winners.length === 1) {
    if ((winners[0].score - round.results[1].score) <= 4) {
      message = "Arena ended. " + winners[0].username + " barely survived as the victor. New arena starting.";
    } else if (winners[0].score > (round.results[1].score * 2)) {
      message = "Arena ended. Outstanding victory for " + winners[0].username + ". New arena starting.";
    } else {
      message = "Arena ended. " + winners[0].username + " was the victor. New arena starting.";
    }
  } else if (winners.length === 2) {
    message = "Arena ended. " + winners[0].username +" tied with " + winners[1].username + ". New arena starting.";
  } else if (winners.length > 2) {
    message = "Arena ended. Result was a tie between " + winners.length + " pilots. New arena starting.";
  }

  //twitter.tweet(message);
  process.send({ cmd: 'irc', msg: message });
  console.log(message);

  database.getCollection('round', function (err, collection) {
    if (err) {
      return;
    }
    collection.insert(round);
  });
};