var fs = require('fs');

exports = module.exports = function (filename) {
  filename = filename || __dirname  + '/logs/access.log';
  var stream = fs.createWriteStream(filename, { flags: 'a' });
  return function (data, client, next) {
    var logData = {};
    for(var key in data) {
      if (key !== 'server') {
        logData[key] = data[key];
      }
    }
    stream.write((new Date()).toString() + "\t" + client.ip + "\t" + process.pid + "\t" + JSON.stringify(logData) + "\n");
    next();
  }
};