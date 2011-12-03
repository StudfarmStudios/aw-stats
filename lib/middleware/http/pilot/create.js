var pilotRepository = require('../../../repositories/pilot');

exports = module.exports = function (respond) {
  return function (req, res, next) {
    var username = req.query.username || (req.body ? req.body.username : undefined);
    var password1 = req.query.password1 || (req.body ? req.body.password1 : undefined);
    var password2 = req.query.password2 || (req.body ? req.body.password2 : undefined);
    var email = req.query.email || (req.body ? req.body.email : undefined);

    if (username === undefined) {
      return next("Username is required");
    }
    if (password1 === undefined) {
      return next("Password1 is required");
    }
    if (password2 === undefined) {
      return next("Password2 is required");
    }
    if (email === undefined) {
      return next("Email is required");
    }
    if (password1 !== password2) {
      return next("Passwords don't match");
    }

    pilotRepository.createPilot(username, password1, email, function (err, data) {
      if (err) {
        return next(err);
      }
      req.user = pilotRepository.filterPilotData(data);
      if (respond) {
        res.send(pilotRepository.filterPilotData(data));
      } else {
        next();
      }
    });
  };
};