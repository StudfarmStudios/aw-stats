var util = require('util'),
    events = require('events'),
    stats = require('../stats');

var ObjectId = require('mongodb').BSONPure.ObjectID;

var Round = module.exports = function (arena, client) {
  this.pilots = [];
  this.client = client;
  this.newRound(arena);
};

util.inherits(Round, events.EventEmitter);

Round.prototype._processPreviousRound = function () {
  console.log("Processing results of the last round");
  var results = [];
  if (this.pilots.length > 0) {
    this.pilots.forEach(function (pilot) {
      pilot.updateFlightTimes();
      var result = {_id: pilot._id,
        playTime: pilot.currentRound.playTime,
        score: pilot.currentRound.score,
        kills: pilot.currentRound.kills.total,
        deaths: pilot.currentRound.deaths.total,
        suicides: pilot.currentRound.suicides.total,
        username: pilot.username,
        oldRating: pilot.currentRound.rating,
        newRating: pilot.rating
      };
      if (pilot.hasLeft()) {
        result.left = pilot.left;
      }
      console.log(pilot.username + ", " + pilot.currentRound.playTime + " hrs, " + pilot.currentRound.score);
      results.push(result);
      pilot.resetCurrentRound();
    });
    stats.saveRound({arena: this.arena, _id: this.id, started: this.started, ended: new Date(), results: results});
  }
};

Round.prototype.getPilotByToken = function (token) {
  for (var i = 0; i < this.pilots.length; i++) {
    var pilot = this.pilots[i];
    if (pilot.token.toString() == token.toString()) {
      return pilot;
    }
  }
};

Round.prototype.getPilotById = function (id) {
  for (var i = 0; i < this.pilots.length; i++) {
    var pilot = this.pilots[i];
    if (pilot._id.toString() == id.toString()) {
      return pilot;
    }
  }
};

Round.prototype.roundFinished = function () {
  if (this.started) {
    this._processPreviousRound();
  }
};

Round.prototype.newRound = function (arena) {
  console.log("New round " + arena);
  this.arena = arena;
  this.started = new Date();
  this.id = new ObjectId();

  for (var i = this.pilots.length - 1; i >= 0; i--) {
    var pilot = this.pilots[i];
    if (pilot.hasLeft()) {
      console.log("Removing " + pilot.username + " from the next round");
      this.pilots.splice(i, 1);
    }
  }

  this.emit('new_round');
};

Round.prototype.addPilot = function (pilot) {

  for (var i = 0; i < this.pilots.length; i++) {
    var p = this.pilots[i];
    if (p._id.toString() == pilot._id.toString()) {
      return;
    }
  }

  console.log("Pilot " + pilot.username + " added");
  this.pilots.push(pilot);
  this.emit('new_pilot', pilot);

};

Round.prototype.removePilot = function (pilot) {
  var index = this.pilots.indexOf(pilot);
  if (index > -1) {
    this.pilots.splice(index, 1);
    this.emit('removed_pilot', pilot);
  }
};