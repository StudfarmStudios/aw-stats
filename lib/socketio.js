var io = require('socket.io').listen(3003);

io.sockets.on('connection', function (socket) {
});

exports.process = function (data) {
  if (data.type == "broadcast") {
    data.cmd = undefined;
    io.sockets.emit('broadcast', data);
  }
};