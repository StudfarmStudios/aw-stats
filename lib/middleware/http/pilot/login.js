var pilotRepository = require('../../../repositories/pilot');

exports = module.exports = function (respond) {
  return function (req, res, next) {

    var username = req.query.username || (req.body ? req.body.username : undefined);
    var password = req.query.password || (req.body ? req.body.password : undefined);

    var authorization = req.headers['authorization'];
    if (authorization) {
      (function () {
        var parts = authorization.split(' ');
        if (parts.length < 2) {
          return;
        }

        var scheme = parts[0]
            , credentials = new Buffer(parts[1], 'base64').toString().split(':');

        if (!/Basic/i.test(scheme)) {
          return;
        }

        username = credentials[0];
        password = credentials[1];
      })();
    }

    if (username === undefined) {
      var err = new Error("Username is required");
      err.data = {username: username};
      return next(err);
    }
    if (password === undefined) {
      var err = new Error("Password is required");
      err.data = {username: username};
      return next(err);
    }

    pilotRepository.login(username, password, function (err, data) {
      if (err) {
        err.data = {username: username};
        return next(err);
      }
      req.user = data;
      pilotRepository.createPilotToken(req.user._id, function (err, data) {
        if (err) {
          err.data = {username: username};
          return next(err);
        }
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