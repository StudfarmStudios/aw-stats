var roundRepository = require('../../../repositories/round');

exports = module.exports = function (respond) {
  return function (req, res, next) {
    var limit = req.params.limit || req.query.limit;
    var page = req.params.page || req.query.page;
    var pilotId = req.params.pilotId || req.query.pilotId;
    var sort = req.params.sortBy || req.query.sortBy || 'started';
    if (limit === undefined) {
      return next(new Error("Specify limit"));
    }
    if (page === undefined) {
      return next(new Error("Specify page"));
    }
    roundRepository.getRounds(page, limit, sort, pilotId, function (err, data) {
      if (err) {
        return next(err);
      }

      req.rounds = data;
      if (respond) {
        roundRepository.getRoundsCount(function (err, count) {
          if (err) {
            return next(err);
          }
          res.send({rounds: data, page: Number(page), limit: Number(limit), total: Number(count)});
        });
      } else {
        next();
      }
    });
  };
};