var cluster = require('cluster');
var numberOfWorkers = require('os').cpus().length;

if (numberOfWorkers > 4) {
  numberOfWorkers = 4;
}

if (cluster.isMaster) {

  var irc = require('./irc');

  var workers = 0;
  for(var i = 0; i < numberOfWorkers; i++) {
    var worker = cluster.fork();
    worker.on('message', function (data) {
      if (typeof data == "object") {
        if (data.cmd && data.cmd == 'irc') {
          irc.say(data.msg);
        }
      }
    });
    workers++;
  }

  cluster.on('death', function(worker) {
    workers--;
    console.log('worker ' + worker.pid + ' died. restarting in 1 second...');
    setTimeout(function(){
      cluster.fork();
    }, 1);
  });

} else {
  console.log("Worker started " + process.pid);
  require('./http.js');
  require('./stats.js');
}



