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

exports.kill = function (killer, victim, arena, roundId) {
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
      return callback(err);
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

exports.suicide = function (victim, arena) {
  if (victim) {
    var update = {$inc: {}};
    update['$inc']["suicides.total"] = 1;
    update['$inc']["score"] = -1;
    if (arena) {
      update['$inc']["suicides.arena." + arena] = 1;
    }

    updatePilot(victim, update);
  }
};

exports.shipInfo = function (pilot, ship, weapon2, device) {
  if (pilot) {
    var update = {$inc: {}};
    update['$inc']["equipment.ship." + ship] = 1;
    update['$inc']["equipment.weapon2." + weapon2] = 1;
    update['$inc']["equipment.device." + device] = 1;
    updatePilot(pilot, update);
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
  database.getCollection('round', function (err, collection) {
    if (err) {
      if (callback) callback(err);
      return;
    }
    collection.insert(round);
  });
};