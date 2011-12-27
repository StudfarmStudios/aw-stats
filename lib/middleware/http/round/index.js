var fs = require('fs');
var files = fs.readdirSync(__dirname);

files.forEach(function (file) {
  if (file !== 'index.js' && file !== 'test') {
    var name = file.split('.')[0];
    exports[name] = require('./'+name);
  }
});
