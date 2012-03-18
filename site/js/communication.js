(function (window, undefined) {
  var socket = io.connect("http://" + document.location.hostname +":3001");
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