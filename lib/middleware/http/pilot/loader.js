var pilotRepository = require('../../../repositories/pilot');

exports = module.exports = function (respond) {
  return function (req, res, next) {
    var id = req.params.id || req.query.id;
    var token = req.params.token || req.query.token;
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
          res.send(req.pilot);
        } else {
          next();
        }
      });
    } else if (token) {
      pilotRepository.getPilotByToken(token, function (err, data) {
        if (err) {
          return next(err);
        }

        req.pilot = pilotRepository.filterPilotData(data);

        if (respond) {
          res.send(req.pilot);
        } else {
          next();
        }
      });
    } else {
      pilotRepository.getPilotByUsername(username, function (err, data) {
        if (err) {
          return next(err);
        }

        req.pilot = pilotRepository.filterPilotData(data);

        if (respond) {
          res.send(req.pilot);
        } else {
          next();
        }
      });
    }
  };
};