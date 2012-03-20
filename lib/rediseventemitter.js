var sys = require('util');
var events = require('events');
var settings = require('./settings');
var redis = require('redis');
var pub = redis.createClient();
var sub = redis.createClient();

pub.select(settings.redisDb, function (err) {
  if (err) {
    console.log(err);
    console.log(err.stack);
  }
});

sub.select(settings.redisDb, function (err) {
  if (err) {
    console.log(err);
    console.log(err.stack);
  }
});

var EventEmitter = function (type) {
  var self = this;
  this.type = type;
  this.sub = sub;
  this.pub = pub;
  this.sub.on('message', function (channel, message) {
    if (channel === type) {
      var parts = message.split(':');
      parts = parts.map(function (item) {
        try {
          return JSON.parse(decodeURIComponent(item));
        } catch (e) {
          return item;
        }
      });
      self.emit.apply(self, parts);
    }
  });
  this.sub.subscribe(this.type);
};

sys.inherits(EventEmitter, events.EventEmitter);

EventEmitter.prototype.trigger = function (cmd) {
  if (arguments.length > 1) {
    cmd = Array.prototype.slice.call(arguments);
  }

  cmd = cmd.map(function (item) {
    item = JSON.stringify(item);
    return encodeURIComponent(item);
  });

  console.log("publish", this.type, cmd.join(":"));

  this.pub.publish(this.type, cmd.join(":"));
};

exports.EventEmitter = EventEmitter;