var util = require('util'),
    events = require('events'),
    stats = require('../stats'),
    utils = require('../utils');


var Pilot = module.exports = function (data, token, client) {
  var self = this;
  this.token = token;
  this.data = data;
  this.currentShip = null;
  this.left = null;
  this.round = client.round;
  this.client = client;
  
  this.__defineGetter__('_id', function () {
    if (self.data)
      return self.data._id;
  });
  this.__defineGetter__('rating', function () {
    if (self.data)
      return self.data.rating || 1500;
  });
  this.__defineGetter__('username', function () {
    if (self.data)
      return self.data.username;
  });
  this.__defineGetter__('score', function () {
    if (self.data)
      return self.data.score || 0;
  });
  this.__defineGetter__('round', function () {
    if (self.data)
      return self.client.round;
  });

  this.resetCurrentRound();
};

util.inherits(Pilot, events.EventEmitter);

Pilot.prototype.resetCurrentRound = function () {
  console.log(this.username + " resetting round scores");
  this.currentRound = {
    rating: this.rating,
    playTime: 0,
    score:0,
    shots:{total:0, weapons:{}},
    hits:{total:0, objects:{}},
    damage:{total:0, objects:{}},
    kills: {total:0, pilots:{}},
    deaths: {total:0, pilots:{}},
    suicides: {total:0}
  };
};

Pilot.prototype.hasLeft = function () {
  return (this.left != null);
};

Pilot.prototype.saveSHDData = function () {
  var update = {$inc: {}};
  update['$inc']["shots.total"] = this.currentRound.shots.total;
  var weapon;
  for (weapon in this.currentRound.shots.weapons) {
    if (weapon.length > 0)
      update['$inc']["shots.weapons." + weapon] = this.currentRound.shots.weapons[weapon];
  }

  update['$inc']["hits.total"] = this.currentRound.hits.total;
  var object;
  for (object in this.currentRound.hits.objects) {
    if (object.length > 0)
      update['$inc']["hits.objects." + object] = this.currentRound.hits.objects[object];
  }

  update['$inc']["damage.total"] = this.currentRound.damage.total;
  var object;
  for (object in this.currentRound.damage.objects) {
    if (object.length > 0)
      update['$inc']["damage.objects." + object] = this.currentRound.damage.objects[object];
  }

  stats.updatePilot(this._id, update);
};

Pilot.prototype.updateFlightTimes = function () {
  var now = new Date();
  var spawned = this.spawned;
  if (spawned) {
    console.log(this.username + " updating flight times");
    var used = now.getTime() - spawned.getTime();
    used = used / (1000 * 60 * 60);

    var update = {$inc: {}};
    if (this.currentShip.ship && this.currentShip.ship.length > 0)
      update['$inc']["equipment.ship." + this.currentShip.ship] = used;
    if (this.currentShip.weapon2 && this.currentShip.weapon2.length > 0)
      update['$inc']["equipment.weapon2." + this.currentShip.weapon2] = used;
    if (this.currentShip.device && this.currentShip.device.length > 0)
      update['$inc']["equipment.device." + this.currentShip.device] = used;
    update['$inc']["playTime"] = used;

    stats.updatePilot(this._id, update);
    this.currentRound.playTime += used;
    this.spawned = null;
  } else {
    console.log(this.username + " had no flight time to update?");
  }
};

Pilot.prototype.leave = function (pos) {
  process.send({ cmd: 'irc', msg: this.username + " left the battle" });
  console.log(this.username + " left the battle");
  this.updateFlightTimes();
  this.left = new Date();
  this.emit('left');
};

Pilot.prototype.updateRating = function (rating) {
  console.log(this.username + " new rating " + rating);
  this.data.rating = rating;
  stats.updatePilot(this._id, {$set: {rating: rating}});
  this.client.send({NewRating: this.token, Rating: rating});
};

Pilot.prototype.kill = function (victim, pos) {
  console.log(this.username + " killed " + (victim ? victim.username : 'anonymous'));
  this.data.score += 2;
  this.currentRound.score += 2;
  this.currentRound.kills.total += 1;
  if (victim) {
    if (this.currentRound.kills.pilots[victim._id] === undefined) {
      this.currentRound.kills.pilots[victim._id] = 0;
    }
    this.currentRound.kills.pilots[victim._id]++;
  }
  stats.kill(this._id, victim ? victim._id : null, this.round.arena.name, this.round.id, pos);
  this.emit('killed', victim, pos);
};

Pilot.prototype.shot = function (weapon, pos) {
  if (this.currentRound.shots.weapons[weapon] == null) {
    this.currentRound.shots.weapons[weapon] = 0;
  }
  this.currentRound.shots.weapons[weapon]++;
  this.currentRound.shots.total++;
  this.emit('shot', weapon, pos);
};

Pilot.prototype.hit = function (object, target, pos) {
  if (this.currentRound.hits.objects[object] == null) {
    this.currentRound.hits.objects[object] = 0;
  }
  this.currentRound.hits.objects[object]++;
  this.currentRound.hits.total++;
  this.emit('hit', object, target, pos);
};

Pilot.prototype.damage = function (object, owner, pos) {
  if (this.currentRound.damage.objects[object] == null) {
    this.currentRound.damage.objects[object] = 0;
  }
  this.currentRound.damage.objects[object]++;
  this.currentRound.damage.total++;
  this.emit('hit', object, owner, pos);
};

Pilot.prototype.death = function (killer, pos) {
  console.log(this.username + " was killed by " + (killer ? killer.username : 'anonymous'));
  this.updateFlightTimes();
  this.data.score -= 1;
  this.currentRound.score -= 1;
  this.currentRound.deaths.total += 1;
  if (killer) {
    if (this.currentRound.deaths.pilots[killer._id] === undefined) {
      this.currentRound.deaths.pilots[killer._id] = 0;
    }
    this.currentRound.deaths.pilots[killer._id]++;
  }

  stats.death(this._id, killer ? killer._id : null, this.round.arena.name, this.round.id, pos);
  this.emit('died', killer, pos);
};

Pilot.prototype.suicide = function (pos) {
  console.log(this.username + " committed suicide");
  this.updateFlightTimes();
  this.currentRound.score -= 1;
  this.currentRound.suicides.total += 1;
  stats.suicide(this._id, this.round.arena.name, this.round.id, pos);
  this.emit('suicide', pos);
  this.emit('died', this, pos);
};

Pilot.prototype.spawn = function (details, pos) {
  console.log(this.username + " spawned with " + details.ship + ", " +details.weapon2 + ", " +details.device);
  this.currentShip = details;
  this.spawned = new Date();
  this.emit('spawn', details, pos);
};

Pilot.prototype.bonus = function (bonus, pos) {
  console.log(this.username + " got a bonus " + bonus);
  stats.bonus(this._id, bonus, this.round.arena.name, this.round.id, pos);
  this.emit('bonus', bonus, pos)
};