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

exports.kill = function (killer, victim, arena, roundId, callback) {
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
      if (callback) callback(err)
    }
    collection.insert({data: new Date(), killer: killer, victim: victim, arena: arena, round: roundId})
  });
};

exports.death = function (victim, killer, arena) {
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

exports.suicide = function (victim, arena, roundId) {
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
        return callback(err);
      }
      collection.insert({data: new Date(), killer: victim, victim: victim, arena: arena, round: roundId})
    });
  }
};

exports.bonus = function (pilot, bonus, arena, roundId) {
  if (pilot) {
    var update = {$inc: {}};
    update['$inc']["bonus." + bonus + ".total"] = 1;
    if (arena) {
      update['$inc']["bonus." + bonus + ".arena." + arena] = 1;
    }
    updatePilot(pilot, update);
    database.getCollection('bonus', function (err, collection) {
      if (err) {
        return callback(err);
      }
      collection.insert({data: new Date(), bonus: bonus, pilot: pilot, arena: arena, round: roundId});
    });
  }
};

exports.saveRound = function (round, callback) {
  round.results.sort(function (a, b) {
    return b.score - a.score;
  });

  var winningScore =  round.results[0] ? round.results[0].score : 0;
  for (var i = 0; i < round.results.length; i++) {
    if (round.results[i].score < winningScore) {
      break;
    }
    console.log(round.results[i].username +" won the round with " + round.results[i].score);
    var update = {$inc: {}};
    update['$inc']["wins.total"] = 1;
    update['$inc']["wins.arena." + round.arena] = 1;

    updatePilot(round.results[i]._id, update);
  }

  database.getCollection('round', function (err, collection) {
    if (err) {
      if (callback) callback(err);
      return;
    }
    collection.insert(round);
  });
};