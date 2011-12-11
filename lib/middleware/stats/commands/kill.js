var stats = require('../../../stats');

exports = module.exports = function () {
  return function(data, client, next) {
    var killer = (data._killer && data._killer._id) ? data._killer._id : null;
    var victim = (data._victim && data._victim._id) ? data._victim._id : null;

    stats.kill(killer, victim, client.arena, client.roundId);
    stats.death(victim, killer, client.arena);

    if (killer) {
      var pilot = client.pilots[killer];
      if (pilot && pilot.currentRound) {
        pilot.currentRound.score += 2;
        if (pilot.currentRound.kills) {
          pilot.currentRound.kills.total += 1;
          if (pilot.currentRound.kills.pilots[victim] === undefined) {
            pilot.currentRound.kills.pilots[victim] = 0;
          }
          pilot.currentRound.kills.pilots[victim]++;
        }
      }
    }

    if (victim) {
      var pilot = client.pilots[victim];
      if (pilot && pilot.currentRound) {
        pilot.currentRound.score += -1;
        if (pilot.currentRound.deaths) {
          pilot.currentRound.deaths.total += 1;
          if (pilot.currentRound.deaths.pilots[killer] === undefined) {
            pilot.currentRound.deaths.pilots[killer] = 0;
          }
          pilot.currentRound.deaths.pilots[killer]++;
        }
      }

      if (pilot && pilot.startedFlying) {
        var now = new Date();
        var playTime = now.getTime() - pilot.startedFlying.getTime();
        var hours = playTime / ( 1000 * 60 * 60 );
        stats.updatePilot(pilot._id, {$inc: {playTime: hours}});
      }
    }

    next();
  };
};