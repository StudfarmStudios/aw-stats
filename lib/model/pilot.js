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
    kills: {total:0, pilots:{}},
    deaths: {total:0, pilots:{}},
    suicides: {total:0}
  };
};

Pilot.prototype.hasLeft = function () {
  return (this.left != null);
};

Pilot.prototype.updateFlightTimes = function () {
  var now = new Date();
  var spawned = this.spawned;
  if (spawned) {
    console.log(this.username + " updating flight times");
    var used = now.getTime() - spawned.getTime();
    used = used / (1000 * 60 * 60);

    var update = {$inc: {}};
    update['$inc']["equipment.ship." + this.currentShip.ship] = used;
    update['$inc']["equipment.weapon2." + this.currentShip.weapon2] = used;
    update['$inc']["equipment.device." + this.currentShip.device] = used;
    update['$inc']["playTime"] = used;

    stats.updatePilot(this._id, update);
    this.currentRound.playTime += used;
    this.spawned = new Date();
  } else {
    console.log(this.username + " had no flight time to update?");
  }
};

Pilot.prototype.leave = function (pos) {
  console.log(this.username + " left the battle");
  this.updateFlightTimes();
  this.left = new Date();
  this.emit('left');
};

Pilot.prototype._expectedResult = function (opponentRating) {
  return 1 / (1 + 10 ^ ((this.rating - opponentRating) / 400 ));
};

Pilot.prototype._getKValue = function () {
  var k = 2;
  if (this.rating < 2100) {
    k = 6;
  } else if (this.rating > 2100 && this.rating < 2400) {
    k = 4;
  }
  return k;
};

Pilot.prototype.updateRating = function (rating) {
  console.log(this.username + " new rating " + rating);
  this.data.rating = rating;
  stats.updatePilot(this._id, {$set: {rating: rating}});
  //this.client.send({NewRating: this.token, Rating: rating}); DISABLING FOR NOW
};

Pilot.prototype.kill = function (victim, pos) {
  console.log(this.username + " killed " + (victim ? victim.username : 'anonymous'));
  this.data.score += 2;
  this.currentRound.score += 2;
  this.currentRound.kills.total += 1;
  if (victim) {

    var newRating = this.rating + this._getKValue() * (1 - this._expectedResult(victim.rating));
    this.updateRating(newRating);

    if (this.currentRound.kills.pilots[victim._id] === undefined) {
      this.currentRound.kills.pilots[victim._id] = 0;
    }
    this.currentRound.kills.pilots[victim._id]++;
  }
  stats.kill(this._id, victim ? victim._id : null, this.round.arena.name, this.round.id, pos);
  this.emit('killed', victim);
};

Pilot.prototype.shot = function (weapon) {

  this.emit('shot', weapon);
};

Pilot.prototype.death = function (killer, pos) {
  console.log(this.username + " was killed by " + (killer ? killer.username : 'anonymous'));
  this.updateFlightTimes();
  this.data.score -= 1;
  this.currentRound.score -= 1;
  this.currentRound.deaths.total += 1;
  if (killer) {
    var newRating = this.rating + this._getKValue() * (0 - this._expectedResult(killer.rating));
    this.updateRating(newRating);

    if (this.currentRound.deaths.pilots[killer._id] === undefined) {
      this.currentRound.deaths.pilots[killer._id] = 0;
    }
    this.currentRound.deaths.pilots[killer._id]++;
  }

  stats.death(this._id, killer ? killer._id : null, this.round.arena.name, this.round.id, pos);
  this.emit('died', killer);
};

Pilot.prototype.suicide = function (pos) {
  console.log(this.username + " committed suicide");
  var newRating = this.rating + this._getKValue() * (0 - this._expectedResult(1500));
  this.updateRating(newRating);

  this.updateFlightTimes();
  this.currentRound.score -= 1;
  this.currentRound.suicides.total += 1;
  stats.suicide(this._id, this.round.arena.name, this.round.id, pos);
  this.emit('suicide');
  this.emit('died', this);
};

Pilot.prototype.spawn = function (details, pos) {
  console.log(this.username + " spawned with " + details.ship + ", " +details.weapon2 + ", " +details.device);
  this.currentShip = details;
  this.spawned = new Date();
  this.emit('spawn', details);
};

Pilot.prototype.bonus = function (bonus, pos) {
  console.log(this.username + " got a bonus " + bonus);
  stats.bonus(this._id, bonus, this.round.arena.name, this.round.id, pos);
  this.emit('bonus', bonus)
};