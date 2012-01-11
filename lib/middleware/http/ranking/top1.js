var pilotRepository = require('../../../repositories/pilot');

exports = module.exports = function (respond) {
  return function (req, res, next) {
    pilotRepository.getTop1Pilots(function (err, data) {
      if (err) {
        return next(err);
      }

      req.top1 = data;

      if (respond) {
        res.send(data);
      } else {
        next();
      }
    });
  };
};