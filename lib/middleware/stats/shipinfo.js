var stats = require('../../stats');

exports = module.exports = function () {
  return function(data, client, next) {
    var pilot = (data._pilot && data._pilot._id) ? data._pilot._id : null;
    var ship = data.Ship;
    var weapon2 = data.Weapon2;
    var device = data.device;
    stats.shipInfo(pilot, ship, weapon2, device);
    next();
  };
};