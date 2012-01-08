var utils = require('../utils');
var database = require('../database');

exports.getRoundById = function (id, callback) {
  if (!utils.isValidObjectId(id)) {
    return callback(new Error("Not a valid round id"));
  }
  database.getCollection('round', function (err, collection) {
    if (err) {
      return callback(err);
    }
    collection.findOne({_id: collection.db.bson_serializer.ObjectID(id.toString())}, function (err, data) {
          if (err) {
            return callback(err);
          }
          if (data == undefined) {
            return callback(new Error("No round found with id " + id));
          }
          callback(null, data);
        })
  });
};

exports.getRounds = function (page, limit, sort, pilotId, callback) {
  database.getCollection('round', function (err, collection) {
    if (err) {
      return callback(err);
    }
    var skip = (page - 1) * limit;

    var options = {limit:limit, skip: skip};
    switch (sort) {
      case "arena":
        options.sort = {"arena.name": 1};
        break;
      case "started":
        options.sort = {"started": -1};
        break;
      case "ended":
        options.sort = {"ended": -1};
        break;
    }
    var query = {};
    if (pilotId) {
      if (!utils.isValidObjectId(pilotId)) {
        return callback(new Error("Not a valid pilot id"));
      }
      query["results._id"] = collection.db.bson_serializer.ObjectID(pilotId.toString());
    }
    var cursor = collection.find(query, options);
    cursor.sort(options.sort);
    cursor.toArray(function (err, data) {
      if (err) {
        return callback(err);
      }
      callback(null, data);
    });
  });
};

exports.getRoundsByDate = function (date, callback) {
  database.getCollection('round', function (err, collection) {
    if (err) {
      return callback(err);
    }
    var dateStart = new Date(date.getTime() - (date.getTime() % 86400000));
    var dateEnd = new Date(dateStart.getTime() + 86400000 - 1);

    var options = {sort: {"ended": -1}};
    var query = {ended: {$gte: dateStart, $lte: dateEnd}};
    var cursor = collection.find(query, options);
    cursor.sort(options.sort);
    cursor.toArray(function (err, data) {
      if (err) {
        return callback(err);
      }
      callback(null, data);
    });
  });
};


exports.getRoundsCount = function (callback) {
  database.getCollection('round', function (err, collection) {
    if (err) {
      return callback(err);
    }

    collection.count(function (err, c) {
      if (err) {
        return callback(err);
      }
      callback(null, c);
    });
  });
};

exports.getRoundKillsById = function (id, callback) {
  if (!utils.isValidObjectId(id)) {
    return callback(new Error("Not a valid round id"));
  }

  var map = function () {
    if (this.victim == null || this.killer == null || this.victim == "" || this.killer == "") {
      return;
    }
    var object = {};
    object[this.victim] = 1;
    emit(this.killer, object);
  };

  var reduce = function (values) {
    var result = {};
    var victim;
    for(victim in values) {
      if (result[victim] == null) {
        result[victim] = 0;
      }
      result[victim] += values[victim];
    }
    return result;
  };

  database.getCollection('kill', function (err, collection) {
    if (err) {
      return callback(err);
    }
    collection.mapReduce(map, reduce, { query: { round: collection.db.bson_serializer.ObjectID(id.toString()) }, out : { inline: 1 } }, function (err, data) {
      callback(err, data)
    });
  });

};