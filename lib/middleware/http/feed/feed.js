var database = require('../../../database');

exports = module.exports = function (respond) {
  return function (req, res, next) {
    var type = req.query.t;
    if (typeof type != "string" || type.length > 10) {
      return next(new Error("Type is not string or it is longer than 10 characters"));
    }
    var co = req.geoip.country.country_code;
    var ip = req.connection.remoteAddress;

    console.log("Event: "+type + " send from " + co + " by " + ip);

    database.getCollection('events', function (err, collection) {
      if (err) {
        if (callback) callback(err);
        return;
      }
      collection.insert({t: type, co: co, ip: ip, date: new Date()});
    });

    res.send({status: "ok"});

  };
};