var pilotRepository = require('../../../repositories/pilot');

exports = module.exports = function (respond) {
  return function (req, res, next) {
    var id = req.params.id || req.query.id || req.pilot._id;
    if (id === undefined) {
      return next(new Error("Specify id"));
    }

    pilotRepository.getRankingsById(id, function (err, data) {
      if (err) {
        return next(err);
      }
      req.rankings = data;
      if (respond) {
        res.send(data);
      } else {
        next();
      }
    });
  };
};