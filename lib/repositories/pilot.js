var utils = require('../utils');
var database = require('../database');
var sechash = require('sechash');
var tokens = {};

var filterPilotData = exports.filterPilotData = function (pilot) {
  if (Array.isArray(pilot)) {
    for (var i = 0; i < pilot.length; i++) {
      pilot[i] = filterPilotData(pilot[i]);
    }
    return pilot;
  }

  pilot.password = undefined;
  pilot.email = undefined;

  return pilot;
};

function updatePilot(id, data) {
  if (!utils.isValidObjectId(id)) {
    return;
  }
  database.getCollection('pilot', function (err, collection) {
    if (err) {
      return callback(err);
    }
    collection.update({_id: collection.db.bson_serializer.ObjectID(id.toString())}, data);
  });
}

exports.getPilotById = function (id, callback) {
  if (!utils.isValidObjectId(id)) {
    return callback(new Error("Not a valid user id"));
  }
  database.getCollection('pilot', function (err, collection) {
    if (err) {
      return callback(err);
    }
    collection.findOne({_id: collection.db.bson_serializer.ObjectID(id.toString())}, function (err, data) {
          if (err) {
            return callback(err);
          }
          if (data == undefined) {
            return callback(new Error("No pilot found with id " + id));
          }
          callback(null, data);
        })
  });
};

exports.getPilotByUsername = function (username, callback) {
  database.getCollection('pilot', function (err, collection) {
    if (err) {
      return callback(err);
    }
    collection.findOne({username: username}, function (err, data) {
          if (err) {
            return callback(err);
          }
          if (data == undefined) {
            return callback(new Error("No pilot found with name " + username));
          }
          callback(null, data);
        })
  });
};

exports.login = function (username, password, callback) {
  exports.getPilotByUsername(username, function(err, data) {
    if (err) {
      return callback(err);
    }
    var result = sechash.testHashSync(password, data.password);
    if (!result) {
      return callback(new Error("Invalid password"));
    }

    updatePilot(data._id, {$set:{lastSeen: new Date()}});
    data.lastSeen = new Date();

    callback(null, data);
  });
};

exports.search = function (search, page, limit, sort, callback) {
  database.getCollection('pilot', function (err, collection) {
    if (err) {
      return callback(err);
    }

    var skip = (page - 1) * limit;

    var options = {limit:limit, skip: skip};
    switch(sort) {
      case "username":
        options.sort = {username: 1};
      break;
      case "score":
        options.sort = {score: -1};
      break;
    }


    var cursor = collection.find({ username :  new RegExp(search) }, options);
    cursor.sort(options.sort);
    cursor.toArray(function (err, data) {
      if (err) {
        return callback(err);
      }
      callback(null, data);
    });
  });
};

exports.createPilot = function (username, password, email, callback) {
  exports.getPilotByUsername(username, function(err, data) {
    if (!err) {
      return callback(new Error("User already exists"));
    }
    database.getCollection('pilot', function (err, collection) {
      if (err) {
        return callback(err);
      }
      var hash = sechash.strongHashSync('md5', password);
      collection.insert({username: username, password:hash, email: email, created: new Date(), lastSeen: new Date(), achievements: [], records:{}, rating: 1500}, {safe:true}, function(err, data) {
            if (err) {
              return callback(err);
            }
            callback(null, data);
          });
    });
  });
};

exports.getPilots = function (page, limit, sort, callback) {
  database.getCollection('pilot', function (err, collection) {
    if (err) {
      return callback(err);
    }
    var skip = (page - 1) * limit;

    var options = {limit:limit, skip: skip};
    switch(sort) {
      case "username":
        options.sort = {username: 1};
      break;
      case "score":
        options.sort = {score: -1};
      break;
    }

    var cursor = collection.find({}, options);
    cursor.sort(options.sort);
    cursor.toArray(function (err, data) {
      if (err) {
        return callback(err);
      }
      callback(null, data);
    });
  });
};

exports.createPilotToken = function (pilotId, callback) {
  database.getCollection('token', function (err, collection) {
    if (err) {
      return callback(err);
    }
    var token = {pilot: pilotId, data: new Date()};
    collection.insert(token, {safe:true}, function(err, data) {
          if (err) {
            return callback(err);
          }
          tokens[token._id] = pilotId;
          callback(null, token);
        });
  });
};

exports.getPilotByToken = function (token, callback) {
  if (!utils.isValidObjectId(token)) {
    return callback(new Error("Not a valid token"));
  }
  if (tokens[token]) {
    exports.getPilotById(tokens[token], callback);
  } else {
    database.getCollection('token', function (err, collection) {
      if (err) {
        return callback(err);
      }
      collection.findOne({_id: collection.db.bson_serializer.ObjectID(token)}, function (err, data) {
            if (err) {
              return callback(err);
            }
            if (data == null) {
              return callback(new Error("No pilot found with the given token"));
            }
            tokens[token] = data.pilot;
            exports.getPilotById(data.pilot, callback);
          });
    });
  }
};