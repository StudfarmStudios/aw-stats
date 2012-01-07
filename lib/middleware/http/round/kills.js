var roundRepository = require('../../../repositories/round');

exports = module.exports = function (respond) {
  return function (req, res, next) {
    var id = req.params.id || req.query.id;
    if (id === undefined) {
      return next(new Error("Specify id"));
    }
    if (id) {
      roundRepository.getRoundKillsById(id, function (err, data) {
        if (err) {
          return next(err);
        }

        req.roundKills = data;

        if (respond) {
          res.send(data);
        } else {
          next();
        }
      });
    }
  };
};