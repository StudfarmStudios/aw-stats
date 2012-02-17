(function (window, undefined) {
  var socket = io.connect("http://assaultwing.com:3003");
  socket.on('broadcast', function (data) {
    if (window.currentView && window.currentView.processBroadcast) {
      window.currentView.processBroadcast(data);
    }
  });

  if (window.aw == undefined) {
    window.aw = {};
  }
  
  window.aw.socket = socket;

})(window);

