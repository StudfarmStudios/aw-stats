var pilotRepository = require('../../../repositories/pilot');

exports = module.exports = function (respond) {
  return function (req, res, next) {
    var username = req.query.username || (req.body ? req.body.username : undefined);
    var password = req.query.password || (req.body ? req.body.password : undefined);

    if (username === undefined) {
      return next(new Error("Username is required"));
    }
    if (password === undefined) {
      return next(new Error("Password is required"));
    }

    pilotRepository.login(username, password, function (err, data) {
      if (err) {
        return next(err);
      }
      req.user = data;
      pilotRepository.createPilotToken(req.user._id, function (err, data) {
        req.user.token = data._id;
        if (respond) {
          res.send(pilotRepository.filterPilotData(req.user));
        } else {
          next();
        }
      });
    });
  };
};