var fs = require('fs');
var path = require('path');
var uglifycss = require('uglifycss');
var exec = require('child_process').exec;
var spawn = require('child_process').spawn;

var css = {
  'site/build/css.css': [
    'site/css/bootstrap.min.css',
    'site/css/darkstrap.css',
    'site/css/aw.css'
  ]
};

var js = {
  'site/build/js.js': [
    "site/js/3rdparty/jquery.min.js",
    "site/js/3rdparty/2.5.3-crypto-min.js",
    "site/js/3rdparty/bootstrap.js",
    "site/js/3rdparty/jquery.observehashchange.min.js",
    "site/js/utils.js",
    "site/js/cache.js",
    "site/js/stats.js",
    "site/js/awl.js",
    "site/js/ui.js",
    "site/js/ui.index.js",
    "site/js/ui.login.js",
    "site/js/ui.view.summary.js",
    "site/js/ui.view.register.js",
    "site/js/ui.view.rounds.js",
    "site/js/ui.view.round.js",
    "site/js/ui.view.pilots.js",
    "site/js/ui.view.pilot.js",
    "site/js/ui.view.notfound.js",
    "site/js/ui.awl.js",
    "site/js/communication.js",
    "site/js/init.js"
  ]
};

// taken and modified from closure-compiler npm
function closureCompiler(input, options, callback) {
  var args, compiler, result, stderr, stdout;

  result = {};
  Object.keys(options).forEach(function (key) {
    return (result[key] = options[key]);
  });
  options = result;

  args = ['-jar', path.join(__dirname, 'bin/compiler.jar')];

  Object.keys(options).forEach(function (key) {
    args.push("--" + key);
    return args.push("" + options[key]);
  });

  args.push('--jscomp_off=uselessCode');
  args.push('--jscomp_off=missingProperties');

  compiler = spawn("java", args);
  stdout = '';
  stderr = '';
  compiler.stdout.setEncoding('utf8');
  compiler.stderr.setEncoding('utf8');
  compiler.stdout.on('data', function (data) {
    return (stdout += data);
  });
  compiler.stderr.on('data', function (data) {
    return (stderr += data);
  });
  compiler.on('exit', function (code) {
    if (stderr.length > 0) {
      return callback(new Error(stderr), stdout);
    }
    return callback(null, stdout);
  });
  return compiler.stdin.end(input);
}

function saveTarget(target, data) {
  fs.writeFileSync(__dirname + "/" + target, data, 'utf8');
}

function joinFiles(files) {
  var data = "";

  files.forEach(function (file) {
    var content = fs.readFileSync(__dirname + "/" + file, "utf8");
    data += "\n" + content.toString();
  });

  return data;
}

function processCssTarget(target, files) {
  var data = joinFiles(files);
  data = uglifycss.processString(data);
  saveTarget(target, data);
}

function processJSTarget(target, files) {
  var data = joinFiles(files);
  data = '(function(window, undefined){' + data + '})(window);\n'
  if (process.env.QUICK && (process.env.QUICK == 1 || process.env.QUICK == "true")) {
    saveTarget(target, data);
    return;
  }
  closureCompiler(data, {}, function (err, result) {
        console.log(err);
        saveTarget(target, result);
      })
}

desc('Debloy');
task('debloy', ['build'], function () {

});

desc('Build all');
task('build', ['build-css', 'build-js'], function () {

});

desc('Build css');
task('build-css', [], function () {
  var target;
  for (target in css) {
    processCssTarget(target, css[target]);
  }
});

desc('Build js');
task('build-js', [], function () {
  var target;
  for (target in js) {
    processJSTarget(target, js[target]);
  }
});

desc('Watch');
task('watch', ["build"], function () {
  var target;
  for (target in js) {
    (function (target) {
      var files = js[target];
      files.forEach(function (file) {
        fs.watchFile(__dirname + "/" + file, { interval:200 }, function (curr, prev) {
              if (prev.nlink === 0 && curr.nlink !== 0) {
                console.log(file + " changed, rebuilding");
                processJSTarget(target, files);
              } else if (curr.mtime > prev.mtime) {
                console.log(file + " changed, rebuilding");
                processJSTarget(target, files);
              }

            });
      });
    })(target);
  }

  // CSS

  for (target in css) {
    (function (target) {
      var files = css[target];
      files.forEach(function (file) {
        fs.watchFile(__dirname + "/" + file, { interval:200 }, function (curr, prev) {
              if (prev.nlink === 0 && curr.nlink !== 0) {
                console.log(file + " changed, rebuilding");
                processCssTarget(target, files);
              } else if (curr.mtime > prev.mtime) {
                console.log(file + " changed, rebuilding");
                processCssTarget(target, files);
              }

            });
      });
    })(target);
  }

});