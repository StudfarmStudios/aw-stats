var settings = require('./settings').mongodb;
var events = require('events');
var util = require('util');
var Db = require('mongodb').Db;
var Server = require('mongodb').Server;

var db =  new Db(settings.collection, new Server(settings.host, settings.port, {auto_reconnect: true}));

var connecting = false;
var emitter = new events.EventEmitter();
emitter.setMaxListeners(1000);

exports.getDb = function (callback) {
  var self = this;
  if (db.state == "notConnected" && connecting == false) {
    connecting = true;
    db.open(function(err, db) {
      connecting = false;
      emitter.emit('connect', err, db);
      if (err) {
        return callback(err);
      }
      return callback(null, db);
    });
  } else if (connecting) {
    return emitter.once('connect', callback);
  } else {
    return callback(null, db);
  }
};

exports.getCollection = function(collection, callback) {
  exports.getDb(function (err, db) {
    if (err) {
      return callback(err);
    }
    db.collection(collection, callback);
  });
};




