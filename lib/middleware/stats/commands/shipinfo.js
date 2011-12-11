var stats = require('../../../stats');

exports = module.exports = function () {
  return function(data, client, next) {
    var pilotId = (data._pilot && data._pilot._id) ? data._pilot._id : null;
    var ship = data.Ship;
    var weapon2 = data.Weapon2;
    var device = data.Device;


    var pilot = client.pilots[pilotId];

    function chechAndUpdate(type, data) {
      if (pilot["current_" + type] == undefined || pilot["current_" + type] != ship) {
        if (pilot["current_" + type + "_started"]) {
          var now = new Date();
          var used = now.getTime() - pilot["current_" + type + "_started"].getTime();
          used = used / (1000 * 60 * 60);
          var update = {$inc: {}};
          update['$inc']["equipment."+type+"." + data] = used;
          stats.updatePilot(pilotId, update);
        }

        pilot["current_" + type + "_started"] = new Date();
        pilot["current_" + type] = data;
      }
    }

    if (pilot) {
      pilot.startedFlying = new Date();

      chechAndUpdate("ship", ship);
      chechAndUpdate("weapon2", weapon2);
      chechAndUpdate("device", device);
    }

  };
};