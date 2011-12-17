var stats = require('../../../stats');

exports = module.exports = function () {
  return function(data, client, next) {
    var pilot = data._pilot;
    var ship = data.Ship;
    var weapon2 = data.Weapon2;
    var device = data.Device;


    if (pilot) {
      pilot.spawn({ship: ship, weapon2: weapon2, device: device}, data._pos);
    }

  };
};