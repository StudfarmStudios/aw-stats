var database = require('./database');
var utils = require('./utils');

function updatePilot(id, data, callback) {
  if (!utils.isValidObjectId(id)) {
    return;
  }
  database.getCollection('pilot', function (err, collection) {
    if (err) {
      if (callback) callback(err)
      return;
    }
    collection.update({_id: collection.db.bson_serializer.ObjectID(id.toString())}, data);
  });
}

exports.updatePilot = updatePilot;

exports.kill = function (killer, victim, arena, roundId, pos) {
  if (killer) {
    var update = {$inc: {}};
    update['$inc']["kills.total"] = 1;
    update['$inc']["score"] = 2;
    if (arena) {
      update['$inc']["kills.arena." + arena] = 1;
    }
    updatePilot(killer, update);
  }

  database.getCollection('kill', function (err, collection) {
    if (err) {
      return;
    }
    collection.insert({data: new Date(), killer: killer, victim: victim, arena: arena, round: roundId, pos: pos})
  });
};

exports.death = function (victim, killer, arena, pos) {
  if (victim) {
    var update = {$inc: {}};
    update['$inc']["deaths.total"] = 1;
    update['$inc']["score"] = -1;
    if (arena) {
      update['$inc']["deaths.arena." + arena] = 1;
    }
    updatePilot(victim, update);
  }
};

exports.suicide = function (victim, arena, roundId, pos) {
  if (victim) {
    var update = {$inc: {}};
    update['$inc']["suicides.total"] = 1;
    update['$inc']["score"] = -1;
    if (arena) {
      update['$inc']["suicides.arena." + arena] = 1;
    }

    updatePilot(victim, update);

    database.getCollection('kill', function (err, collection) {
      if (err) {
        return;
      }
      collection.insert({data: new Date(), killer: victim, victim: victim, arena: arena, round: roundId, pos: pos})
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
      collection.insert({data: new Date(), bonus: bonus, pilot: pilot, arena: arena, round: roundId, pos: pos});
    });
  }
};

exports.saveRound = function (round) {
  if (round.results.length <= 1) {
    return;
  }
  
  round.results.sort(function (a, b) {
    return b.score - a.score;
  });

  var winningScore =  round.results[0] ? round.results[0].score : 0;
  if (winningScore == 0) {
    // NO NEED TO REPORT ANYTHING
    return;
  }
  for (var i = 0; i < round.results.length; i++) {
    if (round.results[i].score < winningScore) {
      break;
    }
    process.send({ cmd: 'irc', msg: round.results[i].username +" won the round with " + round.results[i].score +" points" });
    console.log(round.results[i].username +" won the round with " + round.results[i].score +" points");
    var update = {$inc: {}};
    update['$inc']["wins.total"] = 1;
    update['$inc']["wins.arena." + round.arena.name] = 1;

    updatePilot(round.results[i]._id, update);
  }

  database.getCollection('round', function (err, collection) {
    if (err) {
      return;
    }
    collection.insert(round);
  });
};