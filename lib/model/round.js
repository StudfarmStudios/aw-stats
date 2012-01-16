var util = require('util'),
    events = require('events'),
    stats = require('../stats'),
    utils = require('../utils');

var ObjectId = require('mongodb').BSONPure.ObjectID;

var Round = module.exports = function (arena, client) {
  this.pilots = [];
  this.client = client;
  this.newRound(arena);
};

util.inherits(Round, events.EventEmitter);

Round.prototype._processRatings = function () {
  var roundLengthInHours = ((new Date()).getTime() - this.started.getTime()) / (1000 * 60 * 60);
  console.log("Round lasted "+ roundLengthInHours + " hrs");
  var qualifiedPilots = this.pilots.filter(function (pilot) {
    pilot.updateFlightTimes();
    if ((pilot.currentRound.playTime > (roundLengthInHours / 2))) {
      return true;
    }
    return false;
  });
  console.log("This round had " + qualifiedPilots.length + " pilots that qualify for rating calculations");
  qualifiedPilots.forEach(function (pilot) {
    var newRating = utils.calculateNewRating(pilot, qualifiedPilots);
    pilot.updateRating(newRating);
  });
};

Round.prototype._processPreviousRound = function () {
  console.log("Processing results of the last round");
  var results = [];

  this.results.forEach(function (result) {
    if (result.LoginToken != null && result.LoginToken != "") {
    // IGNORE PILOTS THAT HAVE LOGGED IN
      return;
    }
    results.push({
      anon: true,
      username: result.Name,
      score: result.Score,
      kills: result.Kills,
      deaths: result.Deaths,
      suicides: (2 * result.Kills) - result.Deaths - result.Score
    });
  });

  if (this.pilots.length > 0) {
    this._processRatings();
    this.pilots.forEach(function (pilot) {
      pilot.saveSHDData();
      var result = {_id: pilot._id,
        joined: pilot.currentRound.joined,
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

Round.prototype.roundFinished = function (results) {
  //[{"Name":"dalgor_","LoginToken":"4f142e1359c35e395f000011","Score":0,"Kills":0,"Deaths":0},{"Name":"grp","LoginToken":"","Score":0,"Kills":0,"Deaths":0},{"Name":"Yerted","LoginToken":"4f142d085efe783e5f000138","Score":0,"Kills":0,"Deaths":0},{"Name":"The Bots","LoginToken":"4f0e1eb10a9b017d26000001","Score":-1,"Kills":0,"Deaths":1}]
  this.results = results;
  if (this.started) {
    this._processPreviousRound();
  }
};

Round.prototype.newRound = function (arena) {
  console.log("New round " + arena.name);
  this.arena = arena;
  this.started = new Date();
  this.id = new ObjectId();

  for (var i = this.pilots.length - 1; i >= 0; i--) {
    var pilot = this.pilots[i];
    pilot.currentRound.joined = new Date();
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

  process.send({ cmd: 'irc', msg: "Pilot " + pilot.username + " added to round" });
  console.log("Pilot " + pilot.username + " added");
  pilot.currentRound.joined = new Date();
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