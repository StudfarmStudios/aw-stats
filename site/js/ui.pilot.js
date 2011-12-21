(function (window) {

  var username, content, title;

  var contentHtml = ''
        + '<div class="page-header">'
        + '  <h1></h1>'
        + '</div>'
        + '<div class="row">'
        + '  <div class="span9">'
        + '    <div class="row"><div class="span2"><b>Last played</b></div><div class="span6 lastSeen">Loading</div></div>'
        + '    <div class="row"><div class="span2"><b>Registered</b></div><div class="span6 created">Loading</div></div>'
        + '    <div class="row"><div class="span2"><b>Flight hours</b></div><div class="span6 playTime">Loading</div></div>'
        + '    <br /><h2>Most used</h2>'
        + '    <div class="row most-used-title-row"><div class="span3"><b>Ship</b></div><div class="span3"><b>Weapon</b></div><div class="span3"><b>Mod</b></div></div>'
        + '    <div class="row most-used-image-row"><div class="span3 ship-image"></div><div class="span3 weapon2-image"></div><div class="span3 device-image"></div></div>'
        + '    <div class="row most-used-text-row"><div class="span3 ship-text"></div><div class="span3 weapon2-text"></div><div class="span3 device-text"></div></div>'
        + '    <br /><h2>Data</h2>'
        + '    <div class="row"><div class="span2"><b>Kills</b></div><div class="span6 kills">Loading</div></div>'
        + '    <div class="row"><div class="span2"><b>Deaths</b></div><div class="span6 deaths">Loading</div></div>'
        + '    <div class="row"><div class="span2"><b>Suicides</b></div><div class="span6 suicides">Loading</div></div>'
        + '    <div class="row"><div class="span2"><b>Kills / Deaths</b></div><div class="span6 kdratio">Loading</div></div>'
        + '  </div>'
        + '  <div class="span4 well">'
        + '    <h3>Rankings</h3>'
        + '    <div class="row"><div class="span2"><b>Rating</b></div><div class="span2 rating-rank">Loading</div></div>'
        + '    <div class="row"><div class="span2"><b>Score</b></div><div class="span2 score-rank">Loading</div></div>'
        + '    <div class="row"><div class="span2"><b>Kills</b></div><div class="span2 kills-total-rank">Loading</div></div>'
        + '    <div class="row"><div class="span2"><b>Victories</b></div><div class="span2 wins-total-rank">Loading</div></div>'
        + '    <div class="row"><div class="span2"><b>Flight time</b></div><div class="span2 playTime-rank">Loading</div></div>'
        + '  </div>'
        + '</div>'
        + '';

  function roundNumber (num, dec) {
	  var result = Math.round(num*Math.pow(10,dec))/Math.pow(10,dec);
	  return result;
  }

  function capitaliseFirstLetter (string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

  function hoursToTime (hours) {
    var minutes  = (hours % 1) * 60;
    hours = Math.floor(hours);
    return hours + "h" + (minutes > 0 ? (" " + minutes + "min") : "");
  }

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

      title.html(username + " <small>Score: "+(pilot.score || 0)+", Rating: " + (Math.round(pilot.rating || 1500)) + "</small>");
      content.find('.lastSeen').html(pilot.lastSeen);
      content.find('.created').html(pilot.created);
      content.find('.playTime').html(hoursToTime(pilot.playTime || 0));

      content.find('.kills').html(pilot.kills && pilot.kills.total ? pilot.kills.total : 0);
      content.find('.deaths').html(pilot.deaths && pilot.deaths.total ? pilot.deaths.total : 0);
      content.find('.suicides').html(pilot.suicides && pilot.suicides.total ? pilot.suicides.total : 0);
      content.find('.kdratio').html(roundNumber((pilot.kills && pilot.kills.total ? pilot.kills.total : 0) / (pilot.deaths && pilot.deaths.total ? pilot.deaths.total : 0), 2));


      for (var type in pilot.equipment) {
        var maxValue = 0;
        var maxName = null;
        var total = 0;

        for (var item in pilot.equipment[type]) {
          var value = pilot.equipment[type][item];
          total += value;
          if (value > maxValue) {
            maxValue = value;
            maxName = item;
          }
        }

        content.find('.' + type + '-image').html('<img src="images/stats_'+maxName.toLowerCase()+'.png" />');
        content.find('.' + type + '-text').html("<b>"+capitaliseFirstLetter(maxName) + "</b><br/>(" + Math.round((maxValue / total) * 100) + "%)");

      }


      window.aw.stats.ratings(pilot._id, function (rankings) {
        if (pilot.error) {
          return;
        }

        for (var type in rankings) {
          var suffix = "th";
          var value = rankings[type];
          if (value == 1) {
            suffix = "st";
          } else if (value == 2) {
            suffix = "nd";
          }
          content.find('.' + type.replace('.', '-') + '-rank').html(value + suffix);
        }

      })


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