(function (window) {

  var username, content, title;

  var contentHtml = ''
        + '<div class="page-header">'
        + '  <h1></h1>'
        + '</div>'
        + '<div class="row">'
        + '  <div class="span8">'
        + '    <div class="row"><div class="span2"><b>Last played</b></div><div class="span6 lastSeen">Loading</div></div>'
        + '    <div class="row"><div class="span2"><b>Registered</b></div><div class="span6 created">Loading</div></div>'
        + '    <div class="row"><div class="span2"><b>Flight hours</b></div><div class="span6 playTime">Loading</div></div>'
        + '    <br /><h2>Most used</h2>'
        + '  </div>'
        + '  <div class="span5 well">'
        + '    <h3>Rankings</h3>'
        + '    <div class="row"><div class="span2"><b>Score</b></div><div class="span3">Loading</div></div>'
        + '    <div class="row"><div class="span2"><b>Kills</b></div><div class="span3">Loading</div></div>'
        + '    <div class="row"><div class="span2"><b>Victories</b></div><div class="span3">Loading</div></div>'
        + '    <div class="row"><div class="span2"><b>K/D</b></div><div class="span3">Loading</div></div>'
        + '    <div class="row"><div class="span2"><b>Flight time</b></div><div class="span3">Loading</div></div>'
        + '  </div>'
        + '</div>'
        + '';


  var pilot = function (hash) {
    var parts = hash.split('/');
    username = parts.pop();
    content = $(contentHtml);
    title = content.find('h1');
    title.html(username);
    $('.container .content').html(content);

    window.aw.stats.pilotByUsername(username, function (pilot) {
      if (pilot.error) {
        return;
      }

      title.html(username + " <small>Score: "+pilot.score+", Rating: " + (pilot.rating || 1500) + "</small>");
      content.find('.lastSeen').html(pilot.lastSeen);
      content.find('.created').html(pilot.created);
      content.find('.playTime').html((pilot.playTime || 0) + " hrs");
    });

  };

  if (window.aw == undefined) {
    window.aw = {};
  }

  if (window.aw.ui == undefined) {
    window.aw.ui = {};
  }

  window.aw.ui.pilot = pilot;
})(window);