(function (window) {

  var content,
      pilotList,
      pagination,
      searchForm;

  var contentHtml = document.getElementById('pilots-content-template').innerHTML;

  var pilotHtml = document.getElementById('pilots-pilot-template').innerHTML;

  function roundNumber (num, dec) {
	  var result = Math.round(num*Math.pow(10,dec))/Math.pow(10,dec);
	  return result;
  }

  function hoursToTime (hours) {
    var minutes  = Math.floor((hours % 1) * 60);
    hours = Math.floor(hours);
    return hours + "h" + (minutes > 0 ? (" " + minutes + "min") : "");
  }

  function createPageLink(page, limit, total, search) {
    if (page == 0) {
      return "#!/pilots/1/" + limit + ((search && search != "") ? ("/" + search) : '');
    }

    return "#!/pilots/" + page + "/" + limit + ((search && search != "") ? ("/" + search) : '');
  }

  function createPagination(page, limit, total, search) {
    pagination.empty();
    var previous = $('<li class="prev' + ( (page == 1) ? ' disabled' : '' ) + '"><a href="' + createPageLink(page - 1, limit, total, search) + '">&larr; Previous</a></li>');
    pagination.append(previous);
    var totalPages = Math.ceil(total / limit);
    var i;
    for (i = 1; i <= totalPages; i++) {
      (function (p) {
        var pageButton = $('<li><a href="' + createPageLink(p, limit, total, search) + '">' + p + '</a></li>');
        if (p == page) {
          pageButton.addClass('active');
        }
        pagination.append(pageButton);
      })(i);
    }

    var next = $('<li class="next' + ( (page * limit >= total) ? ' disabled' : '' ) + '"><a href="' + ( (page * limit >= total) ? createPageLink(page + 1, limit, total, search) : window.location.hash ) + '">Next &rarr;</a></li>');
    pagination.append(next);
  }

  function constructPilotList(page, limit, search) {
    var processData = function (data) {
      createPagination(data.page, data.limit, data.total, search);
      $.each(data.pilots, function (indx, pilot) {
        var pilotElement = $(pilotHtml);
        var username = pilot.username;
        if (search && search !=  "") {
          username = username.replace(new RegExp(search, 'g'), "<b>" + search + "</b>");
        }
        pilotElement.find('.pilot-name').html('<a href="#!/pilot/' + pilot.username + '">' + username + '</a>');
        pilotElement.find('.pilot-rating').html(Math.round(pilot.rating || 1500));
        pilotElement.find('.pilot-score').html(pilot.score);
        pilotElement.find('.pilot-flight-time').html(hoursToTime(pilot.playTime || 0));

        pilotList.append(pilotElement);
      });
    };
    if (search == null || search == "") {
      window.aw.stats.pilots(page, limit, 'username', processData);
    } else {
      window.aw.stats.pilotsSearch(page, limit, 'username', search, processData);
    }
  }

  function initSearchForm (page, limit, search) {
    searchForm.find('input').val(search);
    searchForm.find('input').focus();
    searchForm.submit(function() {
      var values = $(this).serializeArray();
      var valuesObject = {};
      for (var i = 0; i < values.length; i++) {
        var value = values[i];
        valuesObject[value.name] = value.value;
      }

      if (valuesObject['search'] != search) {
        window.location = '#!/pilots/' + page + "/" + limit + "/" + valuesObject['search'];
      }
      return false;
    });
  }

  var pilots = function (hash) {
    var page = 1;
    var limit = 15;
    var search = "";

    content = $(contentHtml);
    $('.container .content').html(content);
    pilotList = content.find('.pilot-table');
    pagination = content.find('ul');
    searchForm = $('.container .content .pilots-search');

    $('.nav li').removeClass('active');
    $('.nav .pilots').addClass('active');


    var parts = hash.split('/');
    page = parts[2] || page;
    limit = parts[3] || limit;
    search = parts[4] || search;

    constructPilotList(Number(page), Number(limit), search);
    initSearchForm(page, limit, search);
  };

  if (window.aw == undefined) {
    window.aw = {};
  }

  if (window.aw.ui == undefined) {
    window.aw.ui = {};
  }

  window.aw.ui.pilots = pilots;
})(window);