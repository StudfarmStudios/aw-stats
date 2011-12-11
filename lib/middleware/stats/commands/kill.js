var stats = require('../../../stats');

exports = module.exports = function () {
  return function(data, client, next) {

    var killer = data._killer;
    var victim = data._victim;

    if (killer) {
      killer.kill(victim);
    }

    if (victim) {
      victim.death(killer);
    }

    next();
  };
};