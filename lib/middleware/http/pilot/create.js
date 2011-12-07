var pilotRepository = require('../../../repositories/pilot');
var sanitizer = require('sanitizer');
var validator = require('validator');

exports = module.exports = function (respond) {
  return function (req, res, next) {
    var username = req.query.username || (req.body ? req.body.username : undefined);
    var password1 = req.query.password1 || (req.body ? req.body.password1 : undefined);
    var password2 = req.query.password2 || (req.body ? req.body.password2 : undefined);
    var email = req.query.email || (req.body ? req.body.email : undefined);

    if (username === undefined) {
      return next(new Error("Username is required"));
    }
    if (password1 === undefined) {
      return next(new Error("Password1 is required"));
    }
    if (password2 === undefined) {
      return next(new Error("Password2 is required"));
    }
    if (email === undefined) {
      return next(new Error("Email is required"));
    }
    if (password1 !== password2) {
      return next(new Error("Passwords don't match"));
    }

    username = sanitizer.sanitize(username);
    email = sanitizer.sanitize(email);

    try {
      validator.check(email).isEmail();
    } catch(e) {
      return next(e);
    }

    pilotRepository.createPilot(username, password1, email, function (err, data) {
      if (err) {
        return next(err);
      }

      //TODO SEND EMAIL TO THE NEW PILOT

      req.user = data;
      if (respond) {
        res.send(pilotRepository.filterPilotData(data));
      } else {
        next();
      }
    });
  };
};