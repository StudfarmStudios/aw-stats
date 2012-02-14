var pilotRepository = require('../../../repositories/pilot');
var utils = require('../../../utils');
var sanitizer = require('sanitizer');
var validator = require('validator');


var ips = [];


function removeIp (ip) {
  var indx = ips.indexOf(ip);
  if (indx > -1) {
    ips.splice(indx, 1);
  }
}

function addIp (ip, broadcast) {
  ips.push(ip);
  
  setTimeout(function () {
    removeIp(ip);
  }, 30 * 1000 * 60);

  if (broadcast) {
    process.send({cmd: 'broadcast', data: {cmd: 'user_created', ip: ip}});
  }
}

function hasAlreadyCreated (ip) {
  return ips.indexOf(ip) > -1;
}

process.on('message', function (data) {
  if (data.cmd && data.cmd == 'user_created') {
    addIp(data.ip);
  }
});

exports = module.exports = function (respond) {
  return function (req, res, next) {
    var username = req.query.username || (req.body ? req.body.username : undefined);
    var password1 = req.query.password1 || (req.body ? req.body.password1 : undefined);
    var password2 = req.query.password2 || (req.body ? req.body.password2 : undefined);
    var email = req.query.email || (req.body ? req.body.email : undefined);
    var ip = req.connection.remoteAddress;

    if (username === undefined) {
      return next(new Error("Username is required"));
    }
    if (username == "id" || username == "token" || username == "root") {
      return next(new Error("Username " + username + " is not valid"));
    }
    if (password1 === undefined) {
      return next(new Error("Password1 is required"));
    }
    if (password2 === undefined) {
      return next(new Error("Password2 is required"));
    }
    if (email === undefined) {
      return next(new Error("Email is required"));
    }
    if (password1 !== password2) {
      return next(new Error("Passwords don't match"));
    }

    if (password1.length < 5) {
      return next(new Error("You should select a longer password"));
    }

    if (username.length < 2) {
      return next(new Error("You should select a longer username"));
    }

    if (password1.length > 12) {
      return next(new Error("Password length can't be greater than 12 characters"));
    }

    if (username.length > 12) {
      return next(new Error("Username length can't be greater than 12 characters"));
    }

    if (hasAlreadyCreated(ip)) {
      return next(new Error("You have to wait 30 min before you can create a new account"));
    }

    username = sanitizer.sanitize(username);
    email = sanitizer.sanitize(email);

    try {
      validator.check(email).isEmail();
    } catch(e) {
      return next(e);
    }

    pilotRepository.createPilot(username, password1, email, ip, function (err, data) {
      if (err) {
        return next(err);
      }

      //TODO SEND EMAIL TO THE NEW PILOT

      addIp(ip, true);
      req.user = data;
      if (respond) {
        res.send(pilotRepository.filterPilotData(data));
      } else {
        next();
      }
    });
  };
};