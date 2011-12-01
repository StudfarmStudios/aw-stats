var pilotRepository = require('../../../repositories/pilot');

exports = module.exports = function (respond) {
  return function (req, res, next) {
    var id = req.params.id || req.query.id;
    if (id === undefined) {
      return next("Specify id");
    }
    pilotRepository.getPilotById(id, function (err, data) {
      if (err) {
        return next(err);
      }

      req.pilot = data;

      if (respond) {
        res.end(data);
      } else {
        next();
      }
    });
  };
};