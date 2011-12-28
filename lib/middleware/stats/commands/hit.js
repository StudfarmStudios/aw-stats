var stats = require('../../../stats');

exports = module.exports = function () {
  return function(data, client, next) {
    var receiver = data._receiver;
    var sender = data._sender;
    var type = data.Hit;

    if (sender) {
      sender.hit(type, receiver, data._pos);
    }

    if (receiver) {
      receiver.damage(type, sender, data._pos);
    }

  };
};