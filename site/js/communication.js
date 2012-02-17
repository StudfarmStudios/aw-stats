(function (window, undefined) {
  var socket = io.connect();
  socket.on('broadcast', function (data) {
    if (window.currentView && window.currentView.processBroadcast) {
      window.currentView.processBroadcast(data);
    }
  });
})(window);

