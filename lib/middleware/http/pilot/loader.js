var pilotRepository = require('../../../repositories/pilot');

exports = module.exports = function (respond) {
  return function (req, res, next) {
    var id = req.params.id || req.query.id;
    var username = req.params.username || req.query.username;
    if (id === undefined && username === undefined) {
      return next(new Error("Specify id or username"));
    }
    if (id) {
      pilotRepository.getPilotById(id, function (err, data) {
        if (err) {
          return next(err);
        }

        req.pilot = pilotRepository.filterPilotData(data);

        if (respond) {
          res.send(data);
        } else {
          next();
        }
      });
    } else {
      pilotRepository.getPilotByUsername(username, function (err, data) {
        if (err) {
          return next(err);
        }

        req.pilot = data;

        if (respond) {
          res.send(pilotRepository.filterPilotData(data));
        } else {
          next();
        }
      });
    }
  };
};