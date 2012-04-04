(function (window) {

  var username, content, title;

  var contentHtml = document.getElementById('pilot-content-template').innerHTML;

  function capitaliseFirstLetter (string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

  function roundNumber (num, dec) {
	  var result = Math.round(num*Math.pow(10,dec))/Math.pow(10,dec);
	  return result;
  }

  function hoursToTime (hours) {
    var minutes  = Math.floor((hours % 1) * 60);
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

        content.find('.' + type + '-image').html('<img src="images/stats_'+maxName.replace(/ /g, '_').toLowerCase()+'.png" />');
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
          } else if (value == 3) {
            suffix = "rd";
          }
          content.find('.' + type.replace('.', '-')).html(value + suffix);
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

  if (window.aw.ui.view == undefined) {
    window.aw.ui.view = {};
  }

  window.aw.ui.view.pilot = pilot;
})(window);