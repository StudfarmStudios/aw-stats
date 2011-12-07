var stats = require('../../stats');

exports = module.exports = function () {
  return function(data, client, next) {
    var killer = (data._killer && data._killer._id) ? data._killer._id : null;
    var victim = (data._victim && data._victim._id) ? data._victim._id : null;

    stats.kill(killer, victim, client.arena);
    stats.death(victim, killer, client.arena);
    next();
  };
};