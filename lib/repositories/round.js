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