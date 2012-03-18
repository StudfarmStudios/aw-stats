(function (window, undefined) {
  var socket = io.connect();

  socket.on('connect', function () {
    if (window.loginToken) {
      socket.emit('auth', window.loginToken);
    }
  });

  if (window.aw == undefined) {
    window.aw = {};
  }
  
  window.aw.socket = socket;

})(window);