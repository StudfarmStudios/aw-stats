var cluster = require('cluster');
var numberOfWorkers = require('os').cpus().length;

if (numberOfWorkers > 4) {
  numberOfWorkers = 4;
}

if (cluster.isMaster) {
  var announcementServer = require('./lib/announcementserver');
  var irc = require('./lib/irc');
  var cron = require('./lib/cron');
  var socketio = require('./lib/socketio');
  var workers = [];
  var fork = function () {
    var worker = cluster.fork();
    workers.push(worker);
    var sendToOther = function (data) {
      var i;
      for (i = 0; i < workers.length; i++) {
        var target = workers[i];
        if (worker == target) {
          return;
        }
        worker.send(data);
      }
    };
    worker.on('message', function (data) {
      if (typeof data == "object") {
        if (data.cmd) {
          switch(data.cmd) {
            case "irc":
              irc.say(data.msg);
            break;
            case "socketio":
              socketio.process(data);
            break;
            case "broadcast":
              sendToOther(data.data);
            break;
          }
        }
      }
    });
  };

  for(var i = 0; i < numberOfWorkers; i++) {
    fork();
  }
  cluster.on('death', function(worker) {
    var indx = workers.indexOf(worker);
    if (indx > -1) {
      workers.splice(indx, 1);
    }
    console.log('worker ' + worker.pid + ' died. restarting in 1 second...');
    setTimeout(function(){
      fork();
    }, 1);
  });

} else {
  console.log("Worker started " + process.pid);
  require('./http.js');
  require('./stats.js');
}



